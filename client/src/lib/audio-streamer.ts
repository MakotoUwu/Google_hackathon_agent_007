/**
 * AudioStreamer for playing agent voice responses
 * Handles smooth playback of streaming audio chunks
 */

export class AudioStreamer {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying: boolean = false;
  private nextStartTime: number = 0;

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  /**
   * Add audio chunk to playback queue
   * @param pcmData - Int16 PCM audio data at 16kHz
   */
  async addChunk(pcmData: ArrayBuffer): Promise<void> {
    try {
      // Convert Int16 PCM to Float32 for Web Audio API
      const int16Array = new Int16Array(pcmData);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        // Convert from Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
        float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
      }

      // Create AudioBuffer
      const audioBuffer = this.audioContext.createBuffer(
        1, // Mono
        float32Array.length,
        16000 // Sample rate
      );
      
      audioBuffer.getChannelData(0).set(float32Array);
      
      // Add to queue
      this.audioQueue.push(audioBuffer);
      
      // Start playback if not already playing
      if (!this.isPlaying) {
        this.playNext();
      }
    } catch (error) {
      console.error('Error adding audio chunk:', error);
    }
  }

  /**
   * Play next audio chunk from queue
   */
  private playNext(): void {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift()!;
    
    // Create source node
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode);
    
    // Calculate start time for smooth playback
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    
    // Schedule playback
    source.start(startTime);
    
    // Update next start time
    this.nextStartTime = startTime + audioBuffer.duration;
    
    // Play next chunk when this one ends
    source.onended = () => {
      this.playNext();
    };
  }

  /**
   * Stop playback and clear queue
   */
  stop(): void {
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Resume audio context if suspended
   */
  async resume(): Promise<void> {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Close audio context
   */
  close(): void {
    this.stop();
    this.audioContext.close();
  }
}
