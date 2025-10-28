/**
 * AudioWorklet processor for converting audio to PCM format
 * Runs in separate thread for better performance
 * 
 * Input: Float32 audio from microphone (any sample rate)
 * Output: 16-bit PCM at 16kHz (required by Gemini Live API)
 */

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleRate = 16000; // Target sample rate for Gemini
    this.bufferSize = 4096;
    this.buffer = [];
  }

  /**
   * Process audio samples
   * Called automatically by Web Audio API
   */
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (!input || !input[0]) {
      return true; // Keep processor alive
    }

    const inputData = input[0]; // Mono channel
    
    // Convert Float32 to Int16 PCM
    const pcmData = this.float32ToInt16(inputData);
    
    // Add to buffer
    this.buffer.push(...pcmData);
    
    // Send chunks of audio data
    if (this.buffer.length >= this.bufferSize) {
      const chunk = this.buffer.splice(0, this.bufferSize);
      
      // Convert to Uint8Array for transfer
      const uint8Array = new Uint8Array(chunk.buffer);
      
      // Send to main thread
      this.port.postMessage({
        type: 'audio',
        data: uint8Array
      }, [uint8Array.buffer]); // Transfer ownership for performance
    }
    
    return true; // Keep processor alive
  }

  /**
   * Convert Float32 audio samples to Int16 PCM
   * @param {Float32Array} float32Array - Input audio samples (-1.0 to 1.0)
   * @returns {Int16Array} - PCM samples (-32768 to 32767)
   */
  float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to -1.0 to 1.0 range
      let sample = Math.max(-1, Math.min(1, float32Array[i]));
      
      // Convert to 16-bit integer
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      int16Array[i] = Math.round(sample);
    }
    
    return int16Array;
  }
}

// Register the processor
registerProcessor('audio-processor', AudioProcessor);
