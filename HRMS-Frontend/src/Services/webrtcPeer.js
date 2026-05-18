/**
 * Production-Grade Multi-Participant WebRTC Service
 * Handles all WebRTC functionality for voice, video calls, and meetings
 * Supports both 1-on-1 and multi-participant calls
 */

import { getWebRTCConfig, MEDIA_CONSTRAINTS, CONNECTION_QUALITY, CALL_TIMEOUTS } from '../config/webrtc';

class WebRTCPeer {
  constructor() {
    // Multi-peer connection support
    this.peerConnections = new Map(); // Map<participantEmail, RTCPeerConnection>
    this.remoteStreams = new Map(); // Map<participantEmail, MediaStream>
    this.queuedCandidates = new Map(); // Map<participantEmail, Array<candidate>>
    this.dataChannels = new Map(); // Map<participantEmail, RTCDataChannel>
    
    // Local media
    this.localStream = null;
    this.screenStream = null;
    
    // Call metadata
    this.callId = null;
    this.isInitiator = false;
    this.participants = new Set(); // Set of participant emails
    
    // Callbacks
    this.onSignalCallback = null;
    this.onRemoteStreamCallback = null; // (participantEmail, stream) => void
    this.onRemoteStreamRemovedCallback = null; // (participantEmail) => void
    this.onConnectionStateCallback = null; // (participantEmail, state) => void
    this.onStatsCallback = null;
    this.onParticipantJoinedCallback = null; // (participantEmail) => void
    this.onParticipantLeftCallback = null; // (participantEmail) => void
    
    // Get configuration from config file (with TURN servers)
    this.pcConfig = getWebRTCConfig();
    
    // Statistics tracking
    this.statsIntervals = new Map(); // Map<participantEmail, intervalId>
    this.connectionStartTime = null;
    this.reconnectionAttempts = new Map(); // Map<participantEmail, number>
  }

  /**
   * Initialize WebRTC for multi-participant call
   */
  async initialize(isInitiator = false, callId = null) {
    try {
      this.isInitiator = isInitiator;
      this.callId = callId || this.generateCallId();
      this.connectionStartTime = Date.now();
      
      console.log('✅ WebRTC multi-peer service initialized', {
        isInitiator: this.isInitiator,
        callId: this.callId
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC:', error);
      throw error;
    }
  }

  /**
   * Create peer connection for a specific participant
   */
  createPeerConnection(participantEmail) {
    if (this.peerConnections.has(participantEmail)) {
      console.warn('⚠️ Peer connection already exists for:', participantEmail);
      return this.peerConnections.get(participantEmail);
    }

    console.log('🔗 Creating peer connection for:', participantEmail);

    const peerConnection = new RTCPeerConnection(this.pcConfig);
    
    // Add local stream tracks to this peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`➕ Adding ${track.kind} track to peer connection for ${participantEmail}`);
        peerConnection.addTrack(track, this.localStream);
      });
    }
    
    // Set up event handlers for this peer connection
    this.setupPeerConnectionHandlers(participantEmail, peerConnection);
    
    // Initialize ICE candidate queue for this participant
    if (!this.queuedCandidates.has(participantEmail)) {
      this.queuedCandidates.set(participantEmail, []);
    }
    
    // Initialize reconnection attempts
    this.reconnectionAttempts.set(participantEmail, 0);
    
    // Store peer connection
    this.peerConnections.set(participantEmail, peerConnection);
    this.participants.add(participantEmail);
    
    // Notify callback
    if (this.onParticipantJoinedCallback) {
      this.onParticipantJoinedCallback(participantEmail);
    }
    
    console.log('✅ Peer connection created for:', participantEmail);
    console.log('📊 Total active connections:', this.peerConnections.size);
    
    return peerConnection;
  }

  /**
   * Set up peer connection event handlers for a specific participant
   */
  setupPeerConnectionHandlers(participantEmail, peerConnection) {
    // ICE candidate sending
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onSignalCallback) {
        console.log(`📡 Sending ICE candidate to ${participantEmail}`);

        this.onSignalCallback({
          action: 'ICE_CANDIDATE',
          toEmail: participantEmail,
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          callId: this.callId
        });
      }
    };

    // Remote track / stream
    peerConnection.ontrack = (event) => {
      console.log(`📺 Remote track event received from ${participantEmail}`, event);

      let remoteStream = this.remoteStreams.get(participantEmail);
      
      if (!remoteStream) {
        remoteStream = new MediaStream();
        this.remoteStreams.set(participantEmail, remoteStream);
      }

      if (event.streams && event.streams.length > 0) {
        remoteStream = event.streams[0];
        this.remoteStreams.set(participantEmail, remoteStream);
      } else if (event.track) {
        remoteStream.addTrack(event.track);
      }

      console.log(`📺 Remote stream ready for ${participantEmail}`, {
        streamId: remoteStream?.id,
        videoTracks: remoteStream?.getVideoTracks().length,
        audioTracks: remoteStream?.getAudioTracks().length
      });

      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(participantEmail, remoteStream);
      }
    };

    // Connection state
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`🔗 Connection state for ${participantEmail}:`, state);

      if (this.onConnectionStateCallback) {
        this.onConnectionStateCallback(participantEmail, state);
      }

      if (state === 'connected') {
        console.log(`✅ FULLY CONNECTED to ${participantEmail}`);
        this.startStatsMonitoring(participantEmail);
      }

      if (state === 'failed') {
        console.log(`❌ Connection failed for ${participantEmail}`);
        this.handleConnectionFailure(participantEmail);
      }

      if (state === 'disconnected') {
        console.log(`⚠️ Connection disconnected for ${participantEmail}`);
        // Try to reconnect
        setTimeout(() => {
          if (peerConnection.connectionState === 'disconnected') {
            this.restartIce(participantEmail);
          }
        }, 2000);
      }
    };

    // ICE state
    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      console.log(`🧊 ICE state for ${participantEmail}:`, state);

      if (state === 'failed') {
        this.restartIce(participantEmail);
      }
    };

    // Data channel (for metadata like hand raise, reactions, etc.)
    const dataChannel = peerConnection.createDataChannel('metadata');
    this.setupDataChannel(participantEmail, dataChannel);

    // Handle incoming data channels
    peerConnection.ondatachannel = (event) => {
      console.log(`📊 Data channel received from ${participantEmail}`);
      this.setupDataChannel(participantEmail, event.channel);
    };
  }

  /**
   * Setup data channel for a participant
   */
  setupDataChannel(participantEmail, dataChannel) {
    dataChannel.onopen = () => {
      console.log(`📊 Data channel opened with ${participantEmail}`);
    };
    dataChannel.onclose = () => {
      console.log(`📊 Data channel closed with ${participantEmail}`);
    };
    dataChannel.onerror = (error) => {
      console.error(`❌ Data channel error with ${participantEmail}:`, error);
    };
    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        window.dispatchEvent(new CustomEvent('webrtc_data_channel', { detail: { from: participantEmail, data } }));
      } catch (e) {
        console.warn('Failed to parse data channel message:', e);
      }
    };
    this.dataChannels.set(participantEmail, dataChannel);
  }

  /**
   * Send data via data channel to a specific participant
   */
  sendDataChannelMessage(participantEmail, data) {
    const channel = this.dataChannels.get(participantEmail);
    if (channel && channel.readyState === 'open') {
      channel.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  /**
   * Broadcast data via data channel to all participants
   */
  broadcastDataChannelMessage(data) {
    let sent = 0;
    this.dataChannels.forEach((channel, email) => {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify(data));
        sent++;
      }
    });
    return sent;
  }

  /**
   * Start local media (camera/microphone)
   */
  async startLocalMedia(callType = 'video') {
    try {
      console.log(`🎥 Starting local media for ${callType} call`);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      // Get appropriate constraints from config
      let constraints = MEDIA_CONSTRAINTS[callType] || MEDIA_CONSTRAINTS.video;
      
      // Try to get media with fallback constraints
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (primaryError) {
        console.warn('❌ Primary media constraints failed:', primaryError);
        
        // Try with fallback constraints for video calls
        if (callType === 'video') {
          console.log('🔄 Trying video fallback constraints...');
          try {
            this.localStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS.videoFallback);
            console.log('✅ Video fallback constraints worked');
          } catch (fallbackError) {
            console.warn('❌ Video fallback failed, trying minimal constraints...');
            try {
              this.localStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS.minimal);
              console.log('✅ Minimal constraints worked');
            } catch (minimalError) {
              console.warn('❌ Minimal constraints failed, trying audio-only...');
              this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              console.log('✅ Audio-only stream obtained as last resort');
            }
          }
        } else {
          // For voice calls, try simpler audio constraints
          console.log('🔄 Trying simple audio constraints...');
          this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('✅ Simple audio constraints worked');
        }
      }
      
      // Add tracks to peer connection
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          console.log(`➕ Adding ${track.kind} track to peer connection`);
          this.peerConnection.addTrack(track, this.localStream);
        });
      }
      
      console.log('✅ Local media started successfully');
      console.log('📊 Stream info:', {
        audioTracks: this.localStream.getAudioTracks().length,
        videoTracks: this.localStream.getVideoTracks().length,
        tracks: this.localStream.getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState
        }))
      });
      
      return this.localStream;
    } catch (error) {
      console.error('❌ Failed to start local media:', error);
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to access camera/microphone. ';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        userMessage += 'Please allow camera and microphone permissions in your browser settings.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        userMessage += 'Camera/microphone is already in use by another application. Please close other applications and try again.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        userMessage += 'No camera or microphone found. Please connect a camera/microphone and try again.';
      } else if (error.name === 'NotSupportedError' || error.name === 'ConstraintNotSatisfiedError') {
        userMessage += 'Your camera/microphone does not support the required settings.';
      } else {
        userMessage += 'Please check your camera and microphone settings.';
      }
      
      // Create a custom error with user-friendly message
      const customError = new Error(userMessage);
      customError.originalError = error;
      customError.name = error.name;
      
      throw customError;
    }
  }

  /**
   * Create and send offer to a specific participant (caller side)
   */
  async createOffer(participantEmail) {
    try {
      console.log(`📞 Creating offer for ${participantEmail}...`);
      
      let peerConnection = this.peerConnections.get(participantEmail);
      if (!peerConnection) {
        peerConnection = this.createPeerConnection(participantEmail);
      }
      
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnection.setLocalDescription(offer);
      
      if (this.onSignalCallback) {
        this.onSignalCallback({
          action: 'OFFER',
          toEmail: participantEmail,
          sdp: offer.sdp,
          callId: this.callId
        });
      }
      
      console.log(`✅ Offer created and sent to ${participantEmail}`);
    } catch (error) {
      console.error(`❌ Failed to create offer for ${participantEmail}:`, error);
      throw error;
    }
  }

  /**
   * Handle incoming offer and create answer (callee side)
   */
  async handleOffer(participantEmail, offerSdp) {
    try {
      console.log(`📞 Handling incoming offer from ${participantEmail}...`);
      
      let peerConnection = this.peerConnections.get(participantEmail);
      if (!peerConnection) {
        peerConnection = this.createPeerConnection(participantEmail);
      }
      
      const offer = new RTCSessionDescription({
        type: 'offer',
        sdp: offerSdp
      });
      
      await peerConnection.setRemoteDescription(offer);
      console.log(`✅ Remote description set from offer for ${participantEmail}`);
      
      // Process any queued ICE candidates
      await this.processQueuedCandidates(participantEmail);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      if (this.onSignalCallback) {
        this.onSignalCallback({
          action: 'ANSWER',
          toEmail: participantEmail,
          sdp: answer.sdp,
          callId: this.callId
        });
      }
      
      console.log(`✅ Answer created and sent to ${participantEmail}`);
    } catch (error) {
      console.error(`❌ Failed to handle offer from ${participantEmail}:`, error);
      throw error;
    }
  }

  /**
   * Handle incoming answer (caller side)
   */
  async handleAnswer(participantEmail, answerSdp) {
    try {
      console.log(`📞 Handling incoming answer from ${participantEmail}...`);
      
      const peerConnection = this.peerConnections.get(participantEmail);
      if (!peerConnection) {
        console.error(`❌ No peer connection for ${participantEmail}`);
        return;
      }
      
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: answerSdp
      });
      
      await peerConnection.setRemoteDescription(answer);
      console.log(`✅ Remote description set from answer for ${participantEmail}`);
      
      // Process any queued ICE candidates
      await this.processQueuedCandidates(participantEmail);
      
      console.log(`✅ Answer handled successfully for ${participantEmail}`);
    } catch (error) {
      console.error(`❌ Failed to handle answer from ${participantEmail}:`, error);
      throw error;
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  async handleIceCandidate(participantEmail, candidate, sdpMid, sdpMLineIndex) {
    try {
      console.log(`🧊 Handling ICE candidate from ${participantEmail}`);
      
      let peerConnection = this.peerConnections.get(participantEmail);
      
      if (!peerConnection) {
        console.warn(`⚠️ No peer connection for ${participantEmail}, queuing ICE candidate`);
        if (!this.queuedCandidates.has(participantEmail)) {
          this.queuedCandidates.set(participantEmail, []);
        }
        this.queuedCandidates.get(participantEmail).push({ candidate, sdpMid, sdpMLineIndex });
        return;
      }

      if (peerConnection.remoteDescription) {
        const iceCandidate = new RTCIceCandidate({ candidate, sdpMid, sdpMLineIndex });
        await peerConnection.addIceCandidate(iceCandidate);
        console.log(`✅ ICE candidate added for ${participantEmail}`);
      } else {
        console.log(`⏳ Queuing ICE candidate for ${participantEmail} (no remote description yet)`);
        if (!this.queuedCandidates.has(participantEmail)) {
          this.queuedCandidates.set(participantEmail, []);
        }
        this.queuedCandidates.get(participantEmail).push({ candidate, sdpMid, sdpMLineIndex });
      }
    } catch (error) {
      console.error(`❌ Failed to handle ICE candidate from ${participantEmail}:`, error);
    }
  }

  /**
   * Process queued ICE candidates for a participant
   */
  async processQueuedCandidates(participantEmail) {
    const peerConnection = this.peerConnections.get(participantEmail);
    if (!peerConnection?.remoteDescription) return;

    const queued = this.queuedCandidates.get(participantEmail) || [];
    console.log(`Processing ${queued.length} queued ICE candidates for ${participantEmail}`);

    for (const { candidate, sdpMid, sdpMLineIndex } of queued) {
      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate({ candidate, sdpMid, sdpMLineIndex })
        );
        console.log(`✅ Queued ICE candidate added for ${participantEmail}`);
      } catch (error) {
        console.error(`❌ Error adding queued ICE candidate for ${participantEmail}:`, error);
      }
    }

    this.queuedCandidates.set(participantEmail, []);
  }

  /**
   * Toggle audio track - mutes/unmutes outgoing microphone for ALL participants
   */
  toggleAudio(enabled) {
    if (!this.localStream) {
      console.warn('⚠️ No local stream to toggle audio');
      return;
    }

    const tracks = this.localStream.getAudioTracks();
    if (tracks.length === 0) {
      console.warn('⚠️ No audio tracks found in local stream');
      return;
    }

    // Disable all audio tracks in local stream
    tracks.forEach(track => {
      track.enabled = enabled;
      console.log(`🎙 Audio track "${track.label}" ${enabled ? 'ENABLED (unmuted)' : 'DISABLED (muted)'}`);
    });

    // Update sender tracks in ALL peer connections
    this.peerConnections.forEach((peerConnection, participantEmail) => {
      peerConnection.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === 'audio') {
          sender.track.enabled = enabled;
          console.log(`🎙 Sender audio track to ${participantEmail} ${enabled ? 'ENABLED' : 'DISABLED'}`);
        }
      });
    });

    console.log(`✅ Audio toggle complete for ${this.peerConnections.size} connections: ${enabled ? 'UNMUTED' : 'MUTED'}`);
  }

  /**
   * Toggle video track for ALL participants
   */
  toggleVideo(enabled) {
    if (!this.localStream) {
      console.warn('⚠️ No local stream to toggle video');
      return;
    }
    
    const tracks = this.localStream.getVideoTracks();
    if (tracks.length === 0) {
      console.warn('⚠️ No video tracks found in local stream');
      return;
    }
    
    tracks.forEach(track => {
      track.enabled = enabled;
      console.log(`📹 Video track "${track.label}" ${enabled ? 'ENABLED' : 'DISABLED'}`);
    });

    // Update sender tracks in ALL peer connections
    this.peerConnections.forEach((peerConnection, participantEmail) => {
      peerConnection.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === 'video') {
          sender.track.enabled = enabled;
          console.log(`📹 Sender video track to ${participantEmail} ${enabled ? 'ENABLED' : 'DISABLED'}`);
        }
      });
    });

    console.log(`✅ Video toggle complete for ${this.peerConnections.size} connections: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Start screen sharing - replaces video track in ALL peer connections
   */
  async startScreenShare() {
    try {
      if (this.peerConnections.size === 0) {
        throw new Error('No active peer connections for screen sharing');
      }

      const constraints = MEDIA_CONSTRAINTS.screenShare;
      const screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      const videoTrack = screenStream.getVideoTracks()[0];
      
      // Replace video track in ALL peer connections
      const replacePromises = [];
      this.peerConnections.forEach((peerConnection, participantEmail) => {
        let sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (!sender) {
          console.warn(`⚠️ No existing video sender for ${participantEmail}; adding screen track`);
          peerConnection.addTrack(videoTrack, screenStream);
        } else {
          replacePromises.push(
            sender.replaceTrack(videoTrack).then(() => {
              console.log(`✅ Screen track replaced for ${participantEmail}`);
            })
          );
        }
      });
      
      await Promise.all(replacePromises);
      
      // Renegotiate with all participants
      await this.renegotiateAll();
      
      this.screenStream = screenStream;
      
      // Handle screen share end (when user clicks browser's "Stop sharing" button)
      videoTrack.onended = () => {
        console.log('🖥 Screen share ended by user (browser button)');
        this.stopScreenShare();
        window.dispatchEvent(new CustomEvent('screenshare-ended'));
      };
      
      console.log(`🖥 Screen sharing started for ${this.peerConnections.size} participants`);
      return screenStream;
    } catch (error) {
      console.error('❌ Failed to start screen sharing:', error);
      
      if (error.name === 'NotAllowedError' && error.message.includes('Permission denied')) {
        throw new Error('User cancelled screen sharing');
      }
      
      throw error;
    }
  }

  /**
   * Stop screen sharing - restores camera in ALL peer connections
   */
  async stopScreenShare() {
    try {
      if (!this.screenStream) {
        console.warn('⚠️ No screen stream to stop');
        return;
      }

      // Stop all tracks in screen stream
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;

      // Get original video track
      const videoTrack = this.localStream?.getVideoTracks()[0];
      
      if (videoTrack) {
        // Restore camera in ALL peer connections
        const replacePromises = [];
        this.peerConnections.forEach((peerConnection, participantEmail) => {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            replacePromises.push(
              sender.replaceTrack(videoTrack).then(() => {
                console.log(`✅ Camera track restored for ${participantEmail}`);
              })
            );
          }
        });
        
        await Promise.all(replacePromises);
        
        // Renegotiate with all participants
        await this.renegotiateAll();
      }
      
      console.log('🖥 Screen sharing stopped');
    } catch (error) {
      console.error('❌ Failed to stop screen sharing:', error);
    }
  }

  /**
   * Renegotiate with all participants (after track changes)
   */
  async renegotiateAll() {
    const promises = [];
    this.peerConnections.forEach((peerConnection, participantEmail) => {
      if (peerConnection.signalingState === 'stable') {
        promises.push(
          peerConnection.createOffer().then(async (offer) => {
            await peerConnection.setLocalDescription(offer);
            if (this.onSignalCallback) {
              this.onSignalCallback({
                action: 'OFFER',
                toEmail: participantEmail,
                sdp: offer.sdp,
                callId: this.callId
              });
            }
            console.log(`🔄 Renegotiation offer sent to ${participantEmail}`);
          }).catch(err => {
            console.error(`❌ Renegotiation failed for ${participantEmail}:`, err);
          })
        );
      }
    });
    await Promise.all(promises);
  }

  /**
   * Start connection statistics monitoring for a participant
   */
  startStatsMonitoring(participantEmail) {
    if (this.statsIntervals.has(participantEmail)) return;
    
    const intervalId = setInterval(async () => {
      try {
        const peerConnection = this.peerConnections.get(participantEmail);
        if (!peerConnection) {
          this.stopStatsMonitoring(participantEmail);
          return;
        }
        
        const stats = await peerConnection.getStats();
        const report = this.parseStats(stats);
        
        if (this.onStatsCallback) {
          this.onStatsCallback(participantEmail, report);
        }
      } catch (error) {
        console.error(`❌ Failed to get stats for ${participantEmail}:`, error);
      }
    }, 2000); // Every 2 seconds
    
    this.statsIntervals.set(participantEmail, intervalId);
  }

  /**
   * Stop statistics monitoring for a participant
   */
  stopStatsMonitoring(participantEmail) {
    const intervalId = this.statsIntervals.get(participantEmail);
    if (intervalId) {
      clearInterval(intervalId);
      this.statsIntervals.delete(participantEmail);
    }
  }

  /**
   * Stop all statistics monitoring
   */
  stopAllStatsMonitoring() {
    this.statsIntervals.forEach((intervalId, participantEmail) => {
      clearInterval(intervalId);
    });
    this.statsIntervals.clear();
  }

  /**
   * Parse WebRTC statistics
   */
  parseStats(stats) {
    const report = {
      audio: { inbound: {}, outbound: {} },
      video: { inbound: {}, outbound: {} },
      connection: {}
    };
    
    stats.forEach(stat => {
      if (stat.type === 'inbound-rtp') {
        if (stat.kind === 'audio') {
          report.audio.inbound = {
            packetsReceived: stat.packetsReceived,
            packetsLost: stat.packetsLost,
            jitter: stat.jitter
          };
        } else if (stat.kind === 'video') {
          report.video.inbound = {
            packetsReceived: stat.packetsReceived,
            packetsLost: stat.packetsLost,
            framesReceived: stat.framesReceived,
            framesDropped: stat.framesDropped
          };
        }
      } else if (stat.type === 'outbound-rtp') {
        if (stat.kind === 'audio') {
          report.audio.outbound = {
            packetsSent: stat.packetsSent,
            bytesSent: stat.bytesSent
          };
        } else if (stat.kind === 'video') {
          report.video.outbound = {
            packetsSent: stat.packetsSent,
            bytesSent: stat.bytesSent,
            framesSent: stat.framesSent
          };
        }
      } else if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
        report.connection = {
          currentRoundTripTime: stat.currentRoundTripTime,
          availableOutgoingBitrate: stat.availableOutgoingBitrate,
          availableIncomingBitrate: stat.availableIncomingBitrate
        };
      }
    });
    
    return report;
  }

  /**
   * Restart ICE connection for a specific participant
   */
  async restartIce(participantEmail) {
    try {
      console.log(`🔄 Restarting ICE connection for ${participantEmail}...`);
      const peerConnection = this.peerConnections.get(participantEmail);
      if (peerConnection) {
        await peerConnection.restartIce();
      }
    } catch (error) {
      console.error(`❌ Failed to restart ICE for ${participantEmail}:`, error);
    }
  }

  /**
   * Handle connection failures with retry logic
   */
  handleConnectionFailure(participantEmail) {
    const attempts = this.reconnectionAttempts.get(participantEmail) || 0;
    
    if (attempts >= 3) {
      console.log(`❌ Max reconnection attempts reached for ${participantEmail}`);
      if (this.onConnectionStateCallback) {
        this.onConnectionStateCallback(participantEmail, 'failed');
      }
      return;
    }

    this.reconnectionAttempts.set(participantEmail, attempts + 1);
    console.log(`🔄 Connection failure for ${participantEmail} - attempt ${attempts + 1}/3`);

    setTimeout(() => {
      this.restartIce(participantEmail);
    }, 2000 * (attempts + 1)); // Exponential backoff
  }

  /**
   * Close peer connection for a specific participant
   */
  closePeerConnection(participantEmail) {
    console.log(`🔚 Closing peer connection for ${participantEmail}...`);
    
    // Stop stats monitoring
    this.stopStatsMonitoring(participantEmail);
    
    // Close peer connection
    const peerConnection = this.peerConnections.get(participantEmail);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantEmail);
    }
    
    // Remove remote stream
    this.remoteStreams.delete(participantEmail);
    
    // Remove queued candidates
    this.queuedCandidates.delete(participantEmail);
    
    // Remove data channel
    this.dataChannels.delete(participantEmail);
    
    // Remove from participants set
    this.participants.delete(participantEmail);
    
    // Notify callback
    if (this.onRemoteStreamRemovedCallback) {
      this.onRemoteStreamRemovedCallback(participantEmail);
    }
    
    if (this.onParticipantLeftCallback) {
      this.onParticipantLeftCallback(participantEmail);
    }
    
    console.log(`✅ Peer connection closed for ${participantEmail}. Remaining: ${this.peerConnections.size}`);
  }

  /**
   * Close ALL peer connections and cleanup
   */
  close() {
    console.log('🔚 Closing ALL WebRTC peer connections...');
    
    // Stop all stats monitoring
    this.stopAllStatsMonitoring();
    
    // Close all peer connections
    const emails = Array.from(this.peerConnections.keys());
    emails.forEach(email => {
      const pc = this.peerConnections.get(email);
      if (pc) pc.close();
    });
    this.peerConnections.clear();
    this.remoteStreams.clear();
    this.queuedCandidates.clear();
    this.dataChannels.clear();
    this.participants.clear();
    this.reconnectionAttempts.clear();
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Stop screen stream
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    
    // Reset state
    this.callId = null;
    this.connectionStartTime = null;
    
    console.log('✅ All WebRTC peer connections closed');
  }

  /**
   * Set callback functions
   */
  setCallbacks({
    onSignal,
    onRemoteStream,
    onRemoteStreamRemoved,
    onConnectionState,
    onStats,
    onParticipantJoined,
    onParticipantLeft
  }) {
    this.onSignalCallback = onSignal;
    this.onRemoteStreamCallback = onRemoteStream;
    this.onRemoteStreamRemovedCallback = onRemoteStreamRemoved;
    this.onConnectionStateCallback = onConnectionState;
    this.onStatsCallback = onStats;
    this.onParticipantJoinedCallback = onParticipantJoined;
    this.onParticipantLeftCallback = onParticipantLeft;
  }

  /**
   * Get all remote streams
   */
  getAllRemoteStreams() {
    return Array.from(this.remoteStreams.entries());
  }

  /**
   * Get remote stream for a specific participant
   */
  getRemoteStream(participantEmail) {
    return this.remoteStreams.get(participantEmail);
  }

  /**
   * Get all active participants
   */
  getParticipants() {
    return Array.from(this.participants);
  }

  /**
   * Get connection state for a specific participant
   */
  getConnectionState(participantEmail) {
    const pc = this.peerConnections.get(participantEmail);
    return pc ? pc.connectionState : 'closed';
  }

  /**
   * Get connection duration
   */
  getConnectionDuration() {
    if (!this.connectionStartTime) return 0;
    return Math.floor((Date.now() - this.connectionStartTime) / 1000);
  }

  /**
   * Generate unique call ID
   */
  generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add camera to an existing voice call (upgrade voice → video)
   * Adds camera track to ALL peer connections
   */
  async addCamera() {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = videoStream.getVideoTracks()[0];

      if (!videoTrack) throw new Error('No video track obtained');

      // Add to local stream
      this.localStream.addTrack(videoTrack);

      // Add sender to ALL peer connections and renegotiate
      const promises = [];
      this.peerConnections.forEach((peerConnection, participantEmail) => {
        peerConnection.addTrack(videoTrack, this.localStream);
        
        // Renegotiate
        promises.push(
          peerConnection.createOffer().then(async (offer) => {
            await peerConnection.setLocalDescription(offer);
            if (this.onSignalCallback) {
              this.onSignalCallback({ action: 'OFFER', toEmail: participantEmail, sdp: offer.sdp, callId: this.callId });
            }
          })
        );
      });
      
      await Promise.all(promises);

      console.log(`📹 Camera added to call for ${this.peerConnections.size} participants`);
      return videoTrack;
    } catch (error) {
      console.error('❌ Failed to add camera:', error);
      throw error;
    }
  }

  /**
   * Remove camera from call (downgrade video → voice)
   * Removes camera track from ALL peer connections
   */
  async removeCamera() {
    try {
      const videoTracks = this.localStream?.getVideoTracks() || [];
      videoTracks.forEach(track => {
        track.stop();
        this.localStream.removeTrack(track);
      });

      // Remove video senders from ALL peer connections and renegotiate
      const promises = [];
      this.peerConnections.forEach((peerConnection, participantEmail) => {
        const videoSenders = peerConnection.getSenders().filter(
          s => s.track && s.track.kind === 'video'
        );
        videoSenders.forEach(sender => peerConnection.removeTrack(sender));

        // Renegotiate
        promises.push(
          peerConnection.createOffer().then(async (offer) => {
            await peerConnection.setLocalDescription(offer);
            if (this.onSignalCallback) {
              this.onSignalCallback({ action: 'OFFER', toEmail: participantEmail, sdp: offer.sdp, callId: this.callId });
            }
          })
        );
      });
      
      await Promise.all(promises);

      console.log(`📹 Camera removed from call for ${this.peerConnections.size} participants`);
    } catch (error) {
      console.error('❌ Failed to remove camera:', error);
      throw error;
    }
  }

  /**
   * Replace audio track in all peer connections (for device switching)
   */
  async replaceAudioTrack(newAudioTrack) {
    const promises = [];
    this.peerConnections.forEach((peerConnection, participantEmail) => {
      const sender = peerConnection.getSenders().find(s => s.track?.kind === 'audio');
      if (sender) {
        promises.push(
          sender.replaceTrack(newAudioTrack).then(() => {
            console.log(`✅ Audio track replaced for ${participantEmail}`);
          })
        );
      }
    });
    await Promise.all(promises);
  }

  /**
   * Replace video track in all peer connections (for device switching)
   */
  async replaceVideoTrack(newVideoTrack) {
    const promises = [];
    this.peerConnections.forEach((peerConnection, participantEmail) => {
      const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        promises.push(
          sender.replaceTrack(newVideoTrack).then(() => {
            console.log(`✅ Video track replaced for ${participantEmail}`);
          })
        );
      }
    });
    await Promise.all(promises);
  }

  /**
   * Check if ready for screen share (at least one connected peer)
   */
  isReadyForScreenShare() {
    if (this.peerConnections.size === 0) {
      console.warn('⚠️ No peer connections available for screen sharing');
      return false;
    }
    
    let hasConnected = false;
    this.peerConnections.forEach((pc) => {
      if (pc.connectionState === 'connected' || pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        hasConnected = true;
      }
    });
    
    return hasConnected;
  }

  /**
   * Get audio track states for debugging
   */
  getAudioTrackStates() {
    const localAudio = this.localStream?.getAudioTracks() || [];
    const remoteAudio = [];
    this.remoteStreams.forEach((stream, email) => {
      stream.getAudioTracks().forEach(track => {
        remoteAudio.push({ email, id: track.id, enabled: track.enabled, readyState: track.readyState });
      });
    });
    
    return {
      local: localAudio.map(track => ({
        id: track.id, kind: track.kind, enabled: track.enabled, readyState: track.readyState, muted: track.muted
      })),
      remote: remoteAudio
    };
  }

  /**
   * Get detailed connection info for debugging
   */
  getDetailedConnectionInfo() {
    const info = {
      callId: this.callId,
      isInitiator: this.isInitiator,
      participantCount: this.peerConnections.size,
      participants: {}
    };
    
    this.peerConnections.forEach((pc, email) => {
      info.participants[email] = {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
        hasLocalDescription: !!pc.localDescription,
        hasRemoteDescription: !!pc.remoteDescription,
        senders: pc.getSenders().map(s => ({
          kind: s.track?.kind, enabled: s.track?.enabled, readyState: s.track?.readyState
        })),
        receivers: pc.getReceivers().map(r => ({
          kind: r.track?.kind, enabled: r.track?.enabled, readyState: r.track?.readyState
        }))
      };
    });
    
    return info;
  }

  // ─── Legacy compatibility: single-peer methods ─────────────────────────────
  // These allow existing 1-on-1 call code to work without changes
  // They operate on the first/only peer connection

  /**
   * @deprecated Use createPeerConnection(email) + createOffer(email) instead
   * Legacy: get the single peer connection (for 1-on-1 calls)
   */
  get peerConnection() {
    const first = this.peerConnections.values().next().value;
    return first || null;
  }

  /**
   * @deprecated Use remoteStreams.get(email) instead
   * Legacy: get the single remote stream (for 1-on-1 calls)
   */
  get remoteStream() {
    const first = this.remoteStreams.values().next().value;
    return first || null;
  }
}

// Export singleton instance
export default new WebRTCPeer();
