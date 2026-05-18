import React, { useState, useEffect } from 'react';
import './MeetingSettings.css';

/**
 * Meeting Settings Component - Teams-like settings panel
 * Includes Audio, Video, and General settings
 */
export default function MeetingSettings({ 
  isOpen, 
  onClose, 
  webrtcManager,
  currentSettings,
  onSettingsChange 
}) {
  const [activeTab, setActiveTab] = useState('audio');
  const [audioDevices, setAudioDevices] = useState({ inputs: [], outputs: [] });
  const [videoDevices, setVideoDevices] = useState([]);
  const [settings, setSettings] = useState({
    // Audio Settings
    selectedMicrophone: '',
    selectedSpeaker: '',
    microphoneVolume: 100,
    speakerVolume: 100,
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
    
    // Video Settings
    selectedCamera: '',
    videoResolution: 'auto', // auto, 720p, 480p, 360p
    videoFrameRate: 30,
    mirrorVideo: true,
    backgroundBlur: false,
    
    // General Settings
    autoJoinAudio: true,
    autoJoinVideo: true,
    desktopNotifications: true,
    leaveEmptyCalls: true,
    showParticipantNames: true,
    gridView: 'auto', // auto, gallery, speaker
  });

  useEffect(() => {
    if (isOpen) {
      loadDevices();
      if (currentSettings) {
        setSettings({ ...settings, ...currentSettings });
      }
    }
  }, [isOpen, currentSettings]);

  /**
   * Load available media devices
   */
  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
      const videoInputs = devices.filter(d => d.kind === 'videoinput');

      setAudioDevices({ inputs: audioInputs, outputs: audioOutputs });
      setVideoDevices(videoInputs);

      // Set default devices if not already set
      if (!settings.selectedMicrophone && audioInputs.length > 0) {
        setSettings(prev => ({ ...prev, selectedMicrophone: audioInputs[0].deviceId }));
      }
      if (!settings.selectedSpeaker && audioOutputs.length > 0) {
        setSettings(prev => ({ ...prev, selectedSpeaker: audioOutputs[0].deviceId }));
      }
      if (!settings.selectedCamera && videoInputs.length > 0) {
        setSettings(prev => ({ ...prev, selectedCamera: videoInputs[0].deviceId }));
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  /**
   * Test microphone
   */
  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: settings.selectedMicrophone }
      });
      
      // Create audio context for visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      // Show visual feedback
      console.log('Microphone test started');
      
      // Stop after 3 seconds
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        console.log('Microphone test stopped');
      }, 3000);
    } catch (error) {
      console.error('Error testing microphone:', error);
    }
  };

  /**
   * Test speaker
   */
  const testSpeaker = () => {
    const audio = new Audio('/test-sound.mp3');
    if (settings.selectedSpeaker) {
      audio.setSinkId(settings.selectedSpeaker).catch(console.error);
    }
    audio.volume = settings.speakerVolume / 100;
    audio.play().catch(console.error);
  };

  /**
   * Handle setting change
   */
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Apply settings immediately
    if (webrtcManager) {
      applySettings(key, value);
    }
  };

  /**
   * Apply settings to WebRTC manager
   */
  const applySettings = async (key, value) => {
    try {
      switch (key) {
        case 'selectedMicrophone':
        case 'selectedCamera':
        case 'noiseSuppression':
        case 'echoCancellation':
        case 'autoGainControl':
        case 'videoResolution':
          // Reinitialize stream with new constraints
          if (webrtcManager && webrtcManager.localStream) {
            await webrtcManager.updateMediaConstraints(settings);
          }
          break;
        
        case 'mirrorVideo':
          // Update video element CSS
          const videoElements = document.querySelectorAll('.local-video video');
          videoElements.forEach(video => {
            video.style.transform = value ? 'scaleX(-1)' : 'scaleX(1)';
          });
          break;
      }
    } catch (error) {
      console.error('Error applying settings:', error);
    }
  };

  /**
   * Save settings
   */
  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('meetingSettings', JSON.stringify(settings));
    
    // Notify parent component
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    
    onClose();
  };

  /**
   * Reset to defaults
   */
  const handleReset = () => {
    const defaultSettings = {
      selectedMicrophone: audioDevices.inputs[0]?.deviceId || '',
      selectedSpeaker: audioDevices.outputs[0]?.deviceId || '',
      selectedCamera: videoDevices[0]?.deviceId || '',
      microphoneVolume: 100,
      speakerVolume: 100,
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
      videoResolution: 'auto',
      videoFrameRate: 30,
      mirrorVideo: true,
      backgroundBlur: false,
      autoJoinAudio: true,
      autoJoinVideo: true,
      desktopNotifications: true,
      leaveEmptyCalls: true,
      showParticipantNames: true,
      gridView: 'auto',
    };
    setSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="meeting-settings-overlay">
      <div className="meeting-settings-modal">
        {/* Header */}
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <button
              className={`settings-tab ${activeTab === 'audio' ? 'active' : ''}`}
              onClick={() => setActiveTab('audio')}
            >
              🎙️ Audio
            </button>
            <button
              className={`settings-tab ${activeTab === 'video' ? 'active' : ''}`}
              onClick={() => setActiveTab('video')}
            >
              📹 Video
            </button>
            <button
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ General
            </button>
          </div>

          {/* Main Content */}
          <div className="settings-main">
            {/* Audio Settings */}
            {activeTab === 'audio' && (
              <div className="settings-section">
                <h3>Audio Settings</h3>

                {/* Microphone */}
                <div className="setting-group">
                  <label>Microphone</label>
                  <select
                    value={settings.selectedMicrophone}
                    onChange={(e) => handleSettingChange('selectedMicrophone', e.target.value)}
                  >
                    {audioDevices.inputs.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.substring(0, 5)}`}
                      </option>
                    ))}
                  </select>
                  <button className="test-btn" onClick={testMicrophone}>
                    Test Microphone
                  </button>
                </div>

                {/* Microphone Volume */}
                <div className="setting-group">
                  <label>Microphone Volume: {settings.microphoneVolume}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.microphoneVolume}
                    onChange={(e) => handleSettingChange('microphoneVolume', parseInt(e.target.value))}
                  />
                </div>

                {/* Speaker */}
                <div className="setting-group">
                  <label>Speaker</label>
                  <select
                    value={settings.selectedSpeaker}
                    onChange={(e) => handleSettingChange('selectedSpeaker', e.target.value)}
                  >
                    {audioDevices.outputs.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.substring(0, 5)}`}
                      </option>
                    ))}
                  </select>
                  <button className="test-btn" onClick={testSpeaker}>
                    Test Speaker
                  </button>
                </div>

                {/* Speaker Volume */}
                <div className="setting-group">
                  <label>Speaker Volume: {settings.speakerVolume}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.speakerVolume}
                    onChange={(e) => handleSettingChange('speakerVolume', parseInt(e.target.value))}
                  />
                </div>

                {/* Audio Processing */}
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.noiseSuppression}
                      onChange={(e) => handleSettingChange('noiseSuppression', e.target.checked)}
                    />
                    <span>Noise Suppression</span>
                  </label>
                  <p className="setting-description">
                    Reduce background noise during calls
                  </p>
                </div>

                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.echoCancellation}
                      onChange={(e) => handleSettingChange('echoCancellation', e.target.checked)}
                    />
                    <span>Echo Cancellation</span>
                  </label>
                  <p className="setting-description">
                    Prevent audio feedback and echo
                  </p>
                </div>

                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.autoGainControl}
                      onChange={(e) => handleSettingChange('autoGainControl', e.target.checked)}
                    />
                    <span>Auto Gain Control</span>
                  </label>
                  <p className="setting-description">
                    Automatically adjust microphone volume
                  </p>
                </div>
              </div>
            )}

            {/* Video Settings */}
            {activeTab === 'video' && (
              <div className="settings-section">
                <h3>Video Settings</h3>

                {/* Camera */}
                <div className="setting-group">
                  <label>Camera</label>
                  <select
                    value={settings.selectedCamera}
                    onChange={(e) => handleSettingChange('selectedCamera', e.target.value)}
                  >
                    {videoDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                      </option>
                    ))}
                  </select>
                  <div className="camera-preview">
                    <video id="settings-preview" autoPlay muted playsInline />
                  </div>
                </div>

                {/* Video Resolution */}
                <div className="setting-group">
                  <label>Send Resolution (Maximum)</label>
                  <select
                    value={settings.videoResolution}
                    onChange={(e) => handleSettingChange('videoResolution', e.target.value)}
                  >
                    <option value="auto">Auto</option>
                    <option value="720p">High definition (720p)</option>
                    <option value="480p">Standard definition (480p)</option>
                    <option value="360p">Low definition (360p)</option>
                  </select>
                  <p className="setting-description">
                    Higher resolution uses more bandwidth
                  </p>
                </div>

                {/* Frame Rate */}
                <div className="setting-group">
                  <label>Frame Rate: {settings.videoFrameRate} fps</label>
                  <input
                    type="range"
                    min="15"
                    max="30"
                    step="5"
                    value={settings.videoFrameRate}
                    onChange={(e) => handleSettingChange('videoFrameRate', parseInt(e.target.value))}
                  />
                </div>

                {/* Mirror Video */}
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.mirrorVideo}
                      onChange={(e) => handleSettingChange('mirrorVideo', e.target.checked)}
                    />
                    <span>Mirror My Video</span>
                  </label>
                  <p className="setting-description">
                    Flip your video horizontally
                  </p>
                </div>

                {/* Background Blur */}
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.backgroundBlur}
                      onChange={(e) => handleSettingChange('backgroundBlur', e.target.checked)}
                    />
                    <span>Background Blur (Beta)</span>
                  </label>
                  <p className="setting-description">
                    Blur your background during video calls
                  </p>
                </div>
              </div>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <h3>General Settings</h3>

                {/* Auto Join */}
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.autoJoinAudio}
                      onChange={(e) => handleSettingChange('autoJoinAudio', e.target.checked)}
                    />
                    <span>Automatically Join Audio</span>
                  </label>
                  <p className="setting-description">
                    Turn on microphone when joining meetings
                  </p>
                </div>

                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.autoJoinVideo}
                      onChange={(e) => handleSettingChange('autoJoinVideo', e.target.checked)}
                    />
                    <span>Automatically Join Video</span>
                  </label>
                  <p className="setting-description">
                    Turn on camera when joining meetings
                  </p>
                </div>

                {/* Notifications */}
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.desktopNotifications}
                      onChange={(e) => handleSettingChange('desktopNotifications', e.target.checked)}
                    />
                    <span>Desktop Notifications</span>
                  </label>
                  <p className="setting-description">
                    Show notifications for incoming calls and messages
                  </p>
                </div>

                {/* Leave Empty Calls */}
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.leaveEmptyCalls}
                      onChange={(e) => handleSettingChange('leaveEmptyCalls', e.target.checked)}
                    />
                    <span>Leave Empty Calls</span>
                  </label>
                  <p className="setting-description">
                    Automatically leave if no one else joins after 5 minutes
                  </p>
                </div>

                {/* Grid View */}
                <div className="setting-group">
                  <label>Default View</label>
                  <select
                    value={settings.gridView}
                    onChange={(e) => handleSettingChange('gridView', e.target.value)}
                  >
                    <option value="auto">Auto</option>
                    <option value="gallery">Gallery View</option>
                    <option value="speaker">Speaker View</option>
                  </select>
                  <p className="setting-description">
                    Choose how participants are displayed
                  </p>
                </div>

                {/* Show Names */}
                <div className="setting-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.showParticipantNames}
                      onChange={(e) => handleSettingChange('showParticipantNames', e.target.checked)}
                    />
                    <span>Show Participant Names</span>
                  </label>
                  <p className="setting-description">
                    Display names on video tiles
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <button className="btn-secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
