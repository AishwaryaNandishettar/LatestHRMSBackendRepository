/**
 * WebRTCManager — Production-grade full-mesh WebRTC peer manager.
 *
 * Key design decisions:
 *  - Full-mesh: each peer connects directly to every other peer.
 *  - Perfect Negotiation pattern (RFC 8829):
 *      • "polite" peer = was already in the room when you joined (they rollback on glare)
 *      • "impolite" peer = you (the new joiner) — you ignore incoming offers during glare
 *  - onnegotiationneeded is DISABLED — we use explicit createOffer only to avoid races.
 *  - ICE candidates are queued until remote description is set.
 *  - Automatic ICE restart on failure/disconnect (exponential backoff, max 3 retries).
 *  - Bandwidth caps: 1 Mbps video, 64 kbps audio per sender.
 */

import { getWebRTCConfig } from '../../../../config/webrtc';

const MAX_VIDEO_KBPS = 1000;
const MAX_AUDIO_KBPS = 64;

export default class WebRTCManager {
  constructor() {
    this.peerConnections   = new Map(); // email -> RTCPeerConnection
    this.remoteStreams      = new Map(); // email -> MediaStream
    this.queuedCandidates  = new Map(); // email -> RTCIceCandidateInit[]
    this.makingOffer       = new Map(); // email -> boolean
    this.reconnectAttempts = new Map(); // email -> number
    this.politeSet         = new Set(); // emails we are polite towards (they were here first)

    this.localStream  = null;
    this.screenStream = null;

    // Callbacks — set by MeetingRoom
    this.onRemoteStreamAdded    = null; // (email, stream) => void
    this.onRemoteStreamRemoved  = null; // (email) => void
    this.onSignalingNeeded      = null; // (signal) => void
    this.onConnectionStateChange    = null; // (email, state) => void
    this.onIceConnectionStateChange = null; // (email, state) => void

    this.pcConfig = getWebRTCConfig();
  }

  /**
   * Mark a peer as "polite" — they were in the room before us.
   * Polite peers rollback their own offer when glare occurs.
   */
  markPolite(email) {
    this.politeSet.add(email.toLowerCase().trim());
  }

  /**
   * Create a peer connection for remoteEmail. Idempotent.
   */
  createPeerConnection(remoteEmail) {
    const email = remoteEmail.toLowerCase().trim();
    if (this.peerConnections.has(email)) {
      return this.peerConnections.get(email);
    }

    const pc = new RTCPeerConnection(this.pcConfig);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Remote track handler
    pc.ontrack = (event) => {
      let stream;
      if (event.streams && event.streams[0]) {
        stream = event.streams[0];
      } else {
        stream = this.remoteStreams.get(email) || new MediaStream();
        if (event.track) stream.addTrack(event.track);
      }
      this.remoteStreams.set(email, stream);
      if (this.onRemoteStreamAdded) this.onRemoteStreamAdded(email, stream);
    };

    // ICE candidate
    pc.onicecandidate = (event) => {
      if (event.candidate && this.onSignalingNeeded) {
        this.onSignalingNeeded({
          action: 'ICE_CANDIDATE',
          toEmail: email,
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (this.onConnectionStateChange) this.onConnectionStateChange(email, state);
      if (state === 'connected') {
        this.reconnectAttempts.set(email, 0);
        this._applyBandwidthConstraints(pc);
      }
      if (state === 'failed') {
        this._scheduleReconnect(email, pc);
      }
      if (state === 'disconnected') {
        setTimeout(() => {
          if (pc.connectionState === 'disconnected') this._restartIce(email, pc);
        }, 3000);
      }
    };

    // ICE connection state
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (this.onIceConnectionStateChange) this.onIceConnectionStateChange(email, state);
      if (state === 'failed') this._restartIce(email, pc);
    };

    // DO NOT set onnegotiationneeded — explicit offer/answer only.

    this.queuedCandidates.set(email, []);
    this.makingOffer.set(email, false);
    this.reconnectAttempts.set(email, 0);
    this.peerConnections.set(email, pc);
    return pc;
  }

  /**
   * Create and send an offer to remoteEmail.
   * Call this when YOU are the one initiating the connection to a peer.
   */
  async createOffer(remoteEmail) {
    const email = remoteEmail.toLowerCase().trim();
    const pc = this.peerConnections.get(email) || this.createPeerConnection(email);

    if (this.makingOffer.get(email)) {
      console.warn(`[WRM] createOffer(${email}): already making offer, skipping`);
      return;
    }
    if (pc.signalingState !== 'stable') {
      console.warn(`[WRM] createOffer(${email}): signalingState=${pc.signalingState}, skipping`);
      return;
    }

    try {
      this.makingOffer.set(email, true);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      if (this.onSignalingNeeded) {
        this.onSignalingNeeded({
          action: 'OFFER',
          toEmail: email,
          sdp: pc.localDescription.sdp,
        });
      }
      console.log(`[WRM] Offer sent to ${email}`);
    } catch (err) {
      console.error(`[WRM] createOffer(${email}):`, err);
    } finally {
      this.makingOffer.set(email, false);
    }
  }

  /**
   * Handle an incoming offer. Creates answer and sends it back.
   * Uses Perfect Negotiation: polite peer rolls back on glare, impolite ignores.
   */
  async handleOffer(remoteEmail, offer) {
    const email = remoteEmail.toLowerCase().trim();
    const pc = this.peerConnections.get(email) || this.createPeerConnection(email);

    const isPolite = this.politeSet.has(email);
    const collision = this.makingOffer.get(email) || pc.signalingState !== 'stable';

    if (collision) {
      if (!isPolite) {
        // Impolite (new joiner): ignore the incoming offer, keep our own
        console.warn(`[WRM] Glare with ${email}: impolite, ignoring their offer`);
        return;
      }
      // Polite (existing participant): rollback our pending offer
      console.log(`[WRM] Glare with ${email}: polite, rolling back`);
      try {
        await pc.setLocalDescription({ type: 'rollback' });
        this.makingOffer.set(email, false);
      } catch (e) {
        console.warn(`[WRM] Rollback failed for ${email}:`, e.message);
      }
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await this._flushQueued(email);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (this.onSignalingNeeded) {
        this.onSignalingNeeded({
          action: 'ANSWER',
          toEmail: email,
          sdp: pc.localDescription.sdp,
        });
      }
      console.log(`[WRM] Answer sent to ${email}`);
    } catch (err) {
      console.error(`[WRM] handleOffer(${email}):`, err);
    }
  }

  /**
   * Handle an incoming answer.
   */
  async handleAnswer(remoteEmail, answer) {
    const email = remoteEmail.toLowerCase().trim();
    const pc = this.peerConnections.get(email);
    if (!pc) {
      console.warn(`[WRM] handleAnswer: no PC for ${email}`);
      return;
    }
    if (pc.signalingState === 'stable') {
      console.warn(`[WRM] Stale answer from ${email}, ignoring`);
      return;
    }
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await this._flushQueued(email);
      console.log(`[WRM] Answer applied from ${email}`);
    } catch (err) {
      console.error(`[WRM] handleAnswer(${email}):`, err);
    }
  }

  /**
   * Handle an incoming ICE candidate. Queues if remote description not set yet.
   */
  async handleIceCandidate(remoteEmail, candidateInit) {
    const email = remoteEmail.toLowerCase().trim();
    const pc = this.peerConnections.get(email);
    if (!pc || !pc.remoteDescription) {
      const q = this.queuedCandidates.get(email) || [];
      q.push(candidateInit);
      this.queuedCandidates.set(email, q);
      return;
    }
    try {
      if (candidateInit.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
      }
    } catch (err) {
      // Ignore benign errors (e.g., candidate added after connection closed)
      if (!err.message?.includes('closed')) {
        console.warn(`[WRM] addIceCandidate(${email}):`, err.message);
      }
    }
  }

  toggleAudio(enabled) {
    this.localStream?.getAudioTracks().forEach(t => { t.enabled = enabled; });
  }

  toggleVideo(enabled) {
    this.localStream?.getVideoTracks().forEach(t => { t.enabled = enabled; });
  }

  async replaceAudioTrack(newTrack) {
    const promises = [];
    this.peerConnections.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
      if (sender) promises.push(sender.replaceTrack(newTrack));
    });
    await Promise.all(promises);
  }

  async replaceVideoTrack(newTrack) {
    const promises = [];
    this.peerConnections.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) promises.push(sender.replaceTrack(newTrack));
    });
    await Promise.all(promises);
  }

  async startScreenShare() {
    const ss = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always', width: { max: 1920 }, height: { max: 1080 }, frameRate: { max: 15 } },
      audio: false,
    });
    const track = ss.getVideoTracks()[0];
    const replaces = [];
    this.peerConnections.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) replaces.push(sender.replaceTrack(track));
    });
    await Promise.all(replaces);
    track.onended = () => {
      this.stopScreenShare();
      window.dispatchEvent(new CustomEvent('screenshare-ended'));
    };
    this.screenStream = ss;
    return ss;
  }

  async stopScreenShare() {
    if (!this.screenStream) return;
    this.screenStream.getTracks().forEach(t => t.stop());
    this.screenStream = null;
    const vt = this.localStream?.getVideoTracks()[0];
    if (vt) {
      const replaces = [];
      this.peerConnections.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) replaces.push(sender.replaceTrack(vt));
      });
      await Promise.all(replaces);
    }
  }

  closePeerConnection(remoteEmail) {
    const email = remoteEmail.toLowerCase().trim();
    const pc = this.peerConnections.get(email);
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.close();
      this.peerConnections.delete(email);
    }
    this.remoteStreams.delete(email);
    this.queuedCandidates.delete(email);
    this.makingOffer.delete(email);
    this.reconnectAttempts.delete(email);
    this.politeSet.delete(email);
    if (this.onRemoteStreamRemoved) this.onRemoteStreamRemoved(email);
  }

  closeAll() {
    [...this.peerConnections.keys()].forEach(e => this.closePeerConnection(e));
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
    this.screenStream?.getTracks().forEach(t => t.stop());
    this.screenStream = null;
    this.politeSet.clear();
  }

  // ── private ────────────────────────────────────────────────────────────────

  async _flushQueued(email) {
    const pc = this.peerConnections.get(email);
    if (!pc?.remoteDescription) return;
    const q = this.queuedCandidates.get(email) || [];
    for (const c of q) {
      try {
        if (c.candidate) await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {}
    }
    this.queuedCandidates.set(email, []);
  }

  _restartIce(email, pc) {
    const n = this.reconnectAttempts.get(email) || 0;
    if (n >= 3) {
      console.warn(`[WRM] Max ICE restarts reached for ${email}`);
      return;
    }
    this.reconnectAttempts.set(email, n + 1);
    const delay = 1000 * Math.pow(2, n);
    console.log(`[WRM] ICE restart for ${email} in ${delay}ms (attempt ${n + 1})`);
    setTimeout(() => {
      if (pc.connectionState !== 'closed') {
        pc.restartIce?.();
      }
    }, delay);
  }

  _scheduleReconnect(email, pc) {
    const n = this.reconnectAttempts.get(email) || 0;
    if (n >= 3) {
      if (this.onConnectionStateChange) this.onConnectionStateChange(email, 'failed');
      return;
    }
    this.reconnectAttempts.set(email, n + 1);
    setTimeout(() => {
      if (pc.connectionState === 'failed') this._restartIce(email, pc);
    }, 2000 * Math.pow(2, n));
  }

  _applyBandwidthConstraints(pc) {
    pc.getSenders().forEach(sender => {
      if (!sender.track) return;
      const params = sender.getParameters();
      if (!params.encodings?.length) params.encodings = [{}];
      params.encodings.forEach(enc => {
        enc.maxBitrate = sender.track.kind === 'video'
          ? MAX_VIDEO_KBPS * 1000
          : MAX_AUDIO_KBPS * 1000;
      });
      sender.setParameters(params).catch(() => {});
    });
  }
}
