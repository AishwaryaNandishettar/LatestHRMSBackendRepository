import React, { useState, useEffect } from 'react';
import './MediaSettingsPanel.css';

/**
 * Media Settings Panel - Teams-like settings for audio/video configuration
 */
export default function MediaSettingsPanel({ 
  onClose, 
  webrtcManager, 
  onSettingsChange,
  currentSettings = {}
}) {
  const [activeTab, setActiveTab] = useState('audio');
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('');
  const [selectedVideoInput, setSelectedVideoInput] = useState('');
  const [audioVolume, setAudioVolume] = useState(100);
  const [videoResolution, setVideoResolution] = useState('auto');
  const [videoFrameRate, setVideoFrameRate] = useState(30);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  const [lowLightMode, setLowLightMode] = useState(false);
  const [testingAudio, setTestingAudio] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Load available devices
  useEffect(() => {
    loadMediaDevices();
  }, []);

  // Monitor audio level
  useEffect(() => {
    if (!testingAudio || !webrtcManager?.localStream) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(webrtcManager.localStream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    microphone.connect(analyser);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.round(average));
      if (testingAudio) requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      microphone.disconnect();
      audioContext.close();
    };
  }, [testingAudio, webrtcManager]);

  /**
   * Load available media devices
   */
  const loadMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');

      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);

      // Set defaults
      if (audioInputs.length > 0 && !selectedAudioInput) {
        setSelectedAudioInput(audioInputs[0].deviceId);
      }
      if (audioOutputs.length > 0 && !selectedAudioOutput) {
        setSelectedAudioOutput(audioOutputs[0].deviceId);
      }
      if (videoInputs.length > 0 && !selectedVideoInput) {
        setSelectedVideoInput(videoInputs[0].deviceId);
      }

      console.log('?? Media devices loaded:', {
        audioInputs: audioInputs.length,
        audioOutputs: audioOutputs.length,
        videoInputs: videoInputs.length
      });
    } catch (error) {
      console.error('? Error loading media devices:', error);
    }
  };

  /**
   * Handle audio device change
   */
  const handleAudioInputChange = async (deviceId) => {
    setSelectedAudioInput(deviceId);
    
    try {
      const constraints = {
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation,
          noiseSuppression,
          autoGainControl
        },
        video: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Replace audio track in all peer connections
      if (webrtcManager?.localStream) {
        const oldAudioTrack = webrtcManager.localStream.getAudioTracks()[0];
        const newAudioTrack = stream.getAudioTracks()[0];

        // Update local stream
        webrtcManager.localStream.removeTrack(oldAudioTrack);
        webrtcManager.localStream.addTrack(newAudioTrack);

        // Update all peer connections
        for (const [email, peerConnection] of webrtcManager.peerConnections) {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'audio');
          if (sender) {
            await sender.replaceTrack(newAudioTrack);
            console.log('? Audio device changed for:', email);
          }
        }

        oldAudioTrack.stop();
      }

      onSettingsChange?.({ audioInput: deviceId });
    } catch (error) {
      console.error('? Error changing audio device:', error);
    }
  };

  /**
   * Handle video device change
   */
  const handleVideoInputChange = async (deviceId) => {
    setSelectedVideoInput(deviceId);

    try {
      const constraints = {
        video: {
          deviceId: { exact: deviceId },
          width: getVideoResolutionConstraints(videoResolution).width,
          height: getVideoResolutionConstraints(videoResolution).height,
          frameRate: videoFrameRate
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Replace video track in all peer connections
      if (webrtcManager?.localStream) {
        const oldVideoTrack = webrtcManager.localStream.getVideoTracks()[0];
        const newVideoTrack = stream.getVideoTracks()[0];

        // Update local stream
        webrtcManager.localStream.removeTrack(oldVideoTrack);
        webrtcManager.localStream.addTrack(newVideoTrack);

        // Update all peer connections
        for (const [email, peerConnection] of webrtcManager.peerConnections) {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
            console.log('? Video device changed for:', email);
          }
        }

        oldVideoTrack.stop();
      }

      onSettingsChange?.({ videoInput: deviceId });
    } catch (error) {
      console.error('? Error changing video device:', error);
    }
  };

  /**
   * Handle video resolution change
   */
  const handleResolutionChange = async (resolution) => {
    setVideoResolution(resolution);

    try {
      const constraints = getVideoResolutionConstraints(resolution);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: selectedVideoInput },
          ...constraints,
          frameRate: videoFrameRate
        },
        audio: false
      });

      if (webrtcManager?.localStream) {
        const oldVideoTrack = webrtcManager.localStream.getVideoTracks()[0];
        const newVideoTrack = stream.getVideoTracks()[0];

        webrtcManager.localStream.removeTrack(oldVideoTrack);
        webrtcManager.localStream.addTrack(newVideoTrack);

        // Update all peer connections
        for (const [email, peerConnection] of webrtcManager.peerConnections) {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        }

        oldVideoTrack.stop();
      }

      onSettingsChange?.({ videoResolution: resolution });
    } catch (error) {
      console.error('? Error changing video resolution:', error);
    }
  };

  /**
   * Get video resolution constraints
   */
  const getVideoResolutionConstraints = (resolution) => {
    const resolutions = {
      'auto': { width: { ideal: 1280 }, height: { ideal: 720 } },
      '720p': { width: { ideal: 1280 }, height: { ideal: 720 } },
      '480p': { width: { ideal: 640 }, height: { ideal: 480 } },
      '360p': { width: { ideal: 640 }, height: { ideal: 360 } },
      '240p': { width: { ideal: 320 }, height: { ideal: 240 } }
    };
    return resolutions[resolution] || resolutions['auto'];
  };

  /**
   * Handle audio enhancement toggle
   */
  const handleAudioEnhancement = async (type, value) => {
    try {
      if (type === 'echoCancellation') setEchoCancellation(value);
      if (type === 'noiseSuppression') setNoiseSuppression(value);
      if (type === 'autoGainControl') setAutoGainControl(value);

      // Reapply constraints
      if (webrtcManager?.localStream) {
        const audioTrack = webrtcManager.localStream.getAudioTracks()[0];
        if (audioTrack) {
          await audioTrack.applyConstraints({
            echoCancellation: type === 'echoCancellation' ? value : echoCancellation,
            noiseSuppression: type === 'noiseSuppression' ? value : noiseSuppression,
            autoGainControl: type === 'autoGainControl' ? value : autoGainControl
          });
        }
      }

      onSettingsChange?.({ [type]: value });
    } catch (error) {
      console.error('? Error applying audio enhancement:', error);
    }
  };

  /**
   * Test audio playback
   */
  const testAudioPlayback = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      console.log('?? Audio test tone played');
    } catch (error) {
      console.error('? Error playing test audio:', error);
    }
  };

  return (
    <div className="media-settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="close-btn" onClick={onClose}>?</button>
      </div>

      <div className="settings-container">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <button
            className={\	ab-btn \\}
            onClick={() => setActiveTab('audio')}
          >
            <span className="icon">???</span>
            Audio
          </button>
          <button
            className={\	ab-btn \\}
            onClick={() => setActiveTab('video')}
          >
            <span className="icon">??</span>
            Video
          </button>
          <button
            className={\	ab-btn \\}
            onClick={() => setActiveTab('general')}
          >
            <span className="icon">??</span>
            General
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* Audio Settings */}
          {activeTab === 'audio' && (
            <div className="settings-section">
              <h3>Audio Settings</h3>

              {/* Microphone Selection */}
              <div className="setting-group">
                <label>Microphone</label>
                <select
                  value={selectedAudioInput}
                  onChange={(e) => handleAudioInputChange(e.target.value)}
                  className="device-select"
                >
                  {audioDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || \Microphone \\}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speaker Selection */}
              <div className="setting-group">
                <label>Speaker</label>
                <select
                  value={selectedAudioOutput}
                  onChange={(e) => setSelectedAudioOutput(e.target.value)}
                  className="device-select"
                >
                  {audioDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || \Speaker \\}
                    </option>
                  ))}
                </select>
              </div>

              {/* Volume Control */}
              <div className="setting-group">
                <label>Microphone Volume</label>
                <div className="volume-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="volume-slider"
                  />
                  <span className="volume-value">{audioVolume}%</span>
                </div>
              </div>

              {/* Audio Level Meter */}
              <div className="setting-group">
                <label>Audio Level</label>
                <div className="audio-level-meter">
                  <div className="level-bar" style={{ width: \\%\ }}></div>
                </div>
              </div>

              {/* Audio Enhancements */}
              <div className="setting-group">
                <h4>Audio Enhancements</h4>
                
                <div className="toggle-setting">
                  <label>Echo Cancellation</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={echoCancellation}
                      onChange={(e) => handleAudioEnhancement('echoCancellation', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-setting">
                  <label>Noise Suppression</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={noiseSuppression}
                      onChange={(e) => handleAudioEnhancement('noiseSuppression', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-setting">
                  <label>Auto Gain Control</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={autoGainControl}
                      onChange={(e) => handleAudioEnhancement('autoGainControl', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Test Audio */}
              <div className="setting-group">
                <button className="test-btn" onClick={testAudioPlayback}>
                  ?? Test Speaker
                </button>
                <button
                  className={\	est-btn \\}
                  onClick={() => setTestingAudio(!testingAudio)}
                >
                  {testingAudio ? '?? Stop Microphone Test' : '?? Test Microphone'}
                </button>
              </div>
            </div>
          )}

          {/* Video Settings */}
          {activeTab === 'video' && (
            <div className="settings-section">
              <h3>Video Settings</h3>

              {/* Camera Selection */}
              <div className="setting-group">
                <label>Camera</label>
                <select
                  value={selectedVideoInput}
                  onChange={(e) => handleVideoInputChange(e.target.value)}
                  className="device-select"
                >
                  {videoDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || \Camera \\}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video Preview */}
              <div className="setting-group">
                <label>Preview</label>
                <video
                  autoPlay
                  muted
                  playsInline
                  className="video-preview"
                  ref={(el) => {
                    if (el && webrtcManager?.localStream) {
                      el.srcObject = webrtcManager.localStream;
                    }
                  }}
                />
              </div>

              {/* Resolution Selection */}
              <div className="setting-group">
                <label>Video Resolution</label>
                <select
                  value={videoResolution}
                  onChange={(e) => handleResolutionChange(e.target.value)}
                  className="device-select"
                >
                  <option value="auto">Auto</option>
                  <option value="720p">High Definition (720p)</option>
                  <option value="480p">Standard Definition (480p)</option>
                  <option value="360p">Low Definition (360p)</option>
                  <option value="240p">Very Low (240p)</option>
                </select>
              </div>

              {/* Frame Rate */}
              <div className="setting-group">
                <label>Frame Rate</label>
                <select
                  value={videoFrameRate}
                  onChange={(e) => setVideoFrameRate(Number(e.target.value))}
                  className="device-select"
                >
                  <option value="15">15 FPS (Low Bandwidth)</option>
                  <option value="24">24 FPS (Standard)</option>
                  <option value="30">30 FPS (High Quality)</option>
                </select>
              </div>

              {/* Video Enhancements */}
              <div className="setting-group">
                <h4>Video Enhancements</h4>
                
                <div className="toggle-setting">
                  <label>Low Light Mode</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={lowLightMode}
                      onChange={(e) => setLowLightMode(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>

              <div className="setting-group">
                <div className="toggle-setting">
                  <label>Desktop Notifications</label>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <div className="toggle-setting">
                  <label>Send Diagnostic Info</label>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <div className="toggle-setting">
                  <label>Leave Empty Calls</label>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <p className="info-text">
                  ?? Tip: Adjust these settings before joining a meeting for the best experience.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
