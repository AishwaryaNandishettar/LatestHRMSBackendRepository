/**
 * WebRTC Configuration for Production
 * Configure TURN/STUN servers for different environments
 */

const WEBRTC_CONFIG = {
  development: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun.relay.metered.ca:80" },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: import.meta.env.VITE_TURN_USERNAME,
  credential: import.meta.env.VITE_TURN_CREDENTIAL
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
         username: import.meta.env.VITE_TURN_USERNAME,
  credential: import.meta.env.VITE_TURN_CREDENTIAL
      },
      {
        urls: "turn:global.relay.metered.ca:443",
         username: import.meta.env.VITE_TURN_USERNAME,
  credential: import.meta.env.VITE_TURN_CREDENTIAL
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: import.meta.env.VITE_TURN_USERNAME,
  credential: import.meta.env.VITE_TURN_CREDENTIAL
      },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  },
};

// Media constraints for different call types
export const MEDIA_CONSTRAINTS = {
  voice: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1
    },
    video: false
  },

  video: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1
    },
    video: {
      width: { min: 320, ideal: 1280, max: 1920 },
      height: { min: 240, ideal: 720, max: 1080 },
      frameRate: { min: 15, ideal: 30, max: 60 },
      facingMode: 'user'
    }
  },

  screenShare: {
    audio: true,
    video: {
      width: { max: 1920 },
      height: { max: 1080 },
      frameRate: { max: 30 }
    }
  },

  videoFallback: {
    audio: true,
    video: { width: 640, height: 480, frameRate: 15 }
  },

  minimal: {
    audio: true,
    video: true  // let browser decide constraints
  }
};

// Get configuration based on environment
// Get configuration based on environment
export const getWebRTCConfig = () => {
  const username = import.meta.env.VITE_TURN_USERNAME;
  const credential = import.meta.env.VITE_TURN_CREDENTIAL;

  // ✅ Debug - remove after fixing
  console.log('TURN credentials loaded:', { 
    username: username ? '✅ present' : '❌ undefined', 
    credential: credential ? '✅ present' : '❌ undefined' 
  });

  if (!username || !credential) {
    console.warn('⚠️ TURN credentials missing - using STUN only');
    return {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
  }

  return {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun.relay.metered.ca:80" },
      {
        urls: "turn:global.relay.metered.ca:80",
        username,
        credential
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username,
        credential
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username,
        credential
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username,
        credential
      }
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };
};

// Connection quality thresholds
export const CONNECTION_QUALITY = {
  EXCELLENT: { rtt: 0.05, packetLoss: 0.01 },
  GOOD: { rtt: 0.15, packetLoss: 0.03 },
  FAIR: { rtt: 0.3, packetLoss: 0.05 },
  POOR: { rtt: 0.5, packetLoss: 0.1 }
};

// Call timeout configurations
export const CALL_TIMEOUTS = {
  RING_TIMEOUT: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  RECONNECTION_ATTEMPTS: 3,
  RECONNECTION_DELAY: 2000 // 2 seconds
};

export default {
  getWebRTCConfig,
  MEDIA_CONSTRAINTS,
  CONNECTION_QUALITY,
  CALL_TIMEOUTS
};