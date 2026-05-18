class RingtoneManager {
  constructor() {
    this.audio = null;
    this.interval = null;
    this.audioContext = null;
  }

  play() {
    try {
      console.log('🔔 Starting ringtone...');
      
      // Create audio element with a simple ringtone
      this.audio = new Audio();
      
      // Generate a pleasant two-tone ringtone using Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create the ringtone sound
      const createRingtone = () => {
        const sampleRate = this.audioContext.sampleRate;
        const duration = 1.0; // 1 second
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate two-tone pattern (800Hz and 600Hz)
        for (let i = 0; i < buffer.length; i++) {
          const t = i / sampleRate;
          if (t < 0.4) {
            // First tone (800 Hz) with fade out
            const envelope = 1 - (t / 0.4);
            data[i] = Math.sin(2 * Math.PI * 800 * t) * 0.3 * envelope;
          } else if (t < 0.5) {
            // Silence
            data[i] = 0;
          } else {
            // Second tone (600 Hz) with fade out
            const envelope = 1 - ((t - 0.5) / 0.5);
            data[i] = Math.sin(2 * Math.PI * 600 * t) * 0.3 * envelope;
          }
        }
        
        return buffer;
      };
      
      const ringtoneBuffer = createRingtone();
      
      // Play the ringtone
      const playSound = () => {
        try {
          // Resume audio context if suspended (browser autoplay policy)
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }
          
          const source = this.audioContext.createBufferSource();
          source.buffer = ringtoneBuffer;
          source.connect(this.audioContext.destination);
          source.start(0);
          
          console.log('🔔 Ringtone played');
        } catch (err) {
          console.error('❌ Error playing ringtone:', err);
        }
      };
      
      // Play immediately
      playSound();
      
      // Repeat every 2 seconds
      this.interval = setInterval(playSound, 2000);
      
      console.log('✅ Ringtone started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start ringtone:', error);
    }
  }

  stop() {
    try {
      console.log('🔕 Stopping ringtone...');
      
      // Clear interval
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      
      // Stop audio
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
      
      // Close audio context
      if (this.audioContext) {
        this.audioContext.close().catch(() => {});
        this.audioContext = null;
      }
      
      console.log('✅ Ringtone stopped');
      
    } catch (error) {
      console.error('❌ Error stopping ringtone:', error);
    }
  }
}

// Create a singleton instance
const ringtoneManager = new RingtoneManager();

export default ringtoneManager;