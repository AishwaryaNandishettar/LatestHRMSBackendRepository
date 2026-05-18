/**
 * Enhanced WebRTC Manager with Device Management
 * Extends base WebRTCManager with device switching and advanced features
 */

import WebRTCManager from './WebRTCManager';

class WebRTCManagerEnhanced extends WebRTCManager {
  constructor(config = {}) {
    super(config);
    
    this.currentDevices = {
      microphone: null,
      camera: null,
      speaker: null
    };
    
    this.onDevicesChanged = null;
  }

  /**
   * Get all available media devices
   */
  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      return {
        microphones: devices.filter(d => d.kind === 'audioinput'),
        cameras: devices.filter(d => d.kind === 'videoinput'),
        speakers: devices.filter(d => d.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('❌ Error enumerating devices:', error);
      return { microphones: [], cameras: [], speakers: [] };
    }
  }

  /**
   * Initialize with device monitoring
   */
  async initializeWithDeviceMonitoring(constraints) {
    const stream = await this.initializeLocalStream(constraints);
    
    // Store current devices
    const tracks = stream.getTracks();
    tracks.forEach(track => {
      const settings = track.getSettings();
      if (track.kind === 'audio') {
        this.currentDevices.microphone = settings.deviceId;
      } else if (track.kind === 'video') {
        this.currentDevices.camera = settings.deviceId;
      }
    });

    // Monitor device changes
    navigator.mediaDevices.addEventListener('devicechange', () => {
      this.handleDeviceChange();
    });

    return stream;
  }

  /**
   * Handle device change event
   */
  async handleDeviceChange() {
    console.log('🔄 Device change detected');
    const devices = await this.getAvailableDevices();
    
    if (this.onDevicesChanged) {
      this.onDevicesChanged(devices);
    }
  }

  /**
   * Switch microphone device
   */
  async switchMicrophone(deviceId) {
    console.log('🎙️ Switching microphone to:', deviceId);

    try {
      // Get new audio stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false
      });

      const newAudioTrack = newStream.getAudioTracks()[0];
      const oldAudioTrack = this.localStream.getAudioTracks()[0];

      // Replace track in all peer connections
      for (const [email, peerConnection] of this.peerConnections) {
        const sender = peerConnection.getSenders().find(s => s.track?.kind === 'audio');
        if (sender) {
          await sender.replaceTrack(newAudioTrack);
          console.log('✅ Audio track replaced for:', email);
        }
      }

      // Stop old track and update local stream
      if (oldAudioTrack) {
        oldAudioTrack.stop();
        this.localStream.removeTrack(oldAudioTrack);
      }
      this.localStream.addTrack(newAudioTrack);

      // Update current device
      this.currentDevices.microphone = deviceId;

      console.log('✅ Microphone switched successfully');
      return newAudioTrack;
    } catch (error) {
      console.error('❌ Error switching microphone:', error);
      throw error;
    }
  }

  /**
   * Switch camera device
   */
  async switchCamera(deviceId) {
    console.log('📹 Switching camera to:', deviceId);

    try {
      // Get new video stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { deviceId: { exact: deviceId } }
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = this.localStream.getVideoTracks()[0];

      // Replace track in all peer connections
      for (const [email, peerConnection] of this.peerConnections) {
        const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
          console.log('✅ Video track replaced for:', email);
        }
      }

      // Stop old track and update local stream
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        this.localStream.removeTrack(oldVideoTrack);
      }
      this.localStream.addTrack(newVideoTrack);

      // Update current device
      this.currentDevices.camera = deviceId;

      console.log('✅ Camera switched successfully');
      return newVideoTrack;
    } catch (error) {
      console.error('❌ Error switching camera:', error);
      throw error;
    }
  }

  /**
   * Set speaker device (for audio output)
   */
  async setSpeaker(deviceId, audioElement) {
    console.log('🔊 Setting speaker to:', deviceId);

    try {
      if (audioElement && typeof audioElement.setSinkId === 'function') {
        await audioElement.setSinkId(deviceId);
        this.currentDevices.speaker = deviceId;
        console.log('✅ Speaker set successfully');
        return true;
      } else {
        console.warn('⚠️ setSinkId not supported in this browser');
        return false;
      }
    } catch (error) {
      console.error('❌ Error setting speaker:', error);
      throw error;
    }
  }

  /**
   * Enable/disable noise suppression
   */
  async setNoiseSuppression(enabled) {
    console.log('🔇 Setting noise suppression:', enabled);

    try {
      const audioTrack = this.localStream?.getAudioTracks()[0];
      if (!audioTrack) {
        throw new Error('No audio track available');
      }

      await audioTrack.applyConstraints({
        noiseSuppression: enabled,
        echoCancellation: enabled,
        autoGainControl: enabled
      });

      console.log('✅ Noise suppression set to:', enabled);
      return true;
    } catch (error) {
      console.error('❌ Error setting noise suppression:', error);
      throw error;
    }
  }

  /**
   * Set video resolution
   */
  async setVideoResolution(width, height) {
    console.log('📐 Setting video resolution:', width, 'x', height);

    try {
      const videoTrack = this.localStream?.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track available');
      }

      await videoTrack.applyConstraints({
        width: { ideal: width },
        height: { ideal: height }
      });

      console.log('✅ Video resolution set');
      return true;
    } catch (error) {
      console.error('❌ Error setting video resolution:', error);
      throw error;
    }
  }

  /**
   * Set video frame rate
   */
  async setVideoFrameRate(frameRate) {
    console.log('🎬 Setting video frame rate:', frameRate);

    try {
      const videoTrack = this.localStream?.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track available');
      }

      await videoTrack.applyConstraints({
        frameRate: { ideal: frameRate }
      });

      console.log('✅ Video frame rate set');
      return true;
    } catch (error) {
      console.error('❌ Error setting video frame rate:', error);
      throw error;
    }
  }

  /**
   * Get current device settings
   */
  getCurrentDevices() {
    return { ...this.currentDevices };
  }

  /**
   * Get audio level (for volume indicator)
   */
  getAudioLevel() {
    if (!this.localStream) return 0;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) return 0;

    // Create audio context for level detection
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.localStream);
      this.microphone.connect(this.analyser);
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
    return Math.min(100, (average / 255) * 100);
  }

  /**
   * Test microphone (returns audio level stream)
   */
  startMicrophoneTest(callback) {
    if (!this.micTestInterval) {
      this.micTestInterval = setInterval(() => {
        const level = this.getAudioLevel();
        if (callback) callback(level);
      }, 100);
    }
  }

  /**
   * Stop microphone test
   */
  stopMicrophoneTest() {
    if (this.micTestInterval) {
      clearInterval(this.micTestInterval);
      this.micTestInterval = null;
    }
  }

  /**
   * Test speaker (play test sound)
   */
  async testSpeaker(audioElement) {
    console.log('🔊 Testing speaker');

    try {
      // Create test tone
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440; // A4 note
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 1000);

      return true;
    } catch (error) {
      console.error('❌ Error testing speaker:', error);
      throw error;
    }
  }

  /**
   * Get video track settings
   */
  getVideoSettings() {
    const videoTrack = this.localStream?.getVideoTracks()[0];
    if (!videoTrack) return null;

    return videoTrack.getSettings();
  }

  /**
   * Get audio track settings
   */
  getAudioSettings() {
    const audioTrack = this.localStream?.getAudioTracks()[0];
    if (!audioTrack) return null;

    return audioTrack.getSettings();
  }

  /**
   * Cleanup audio context
   */
  cleanup() {
    this.stopMicrophoneTest();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    super.closeAll();
  }
}

export default WebRTCManagerEnhanced;
