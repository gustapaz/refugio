export class Ambience {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  async play(kind: "rain" | "wind" | "stream", volume: number) {
    if (!this.context) {
      this.context = new AudioContext();
      const c = this.context,
        b = c.createBuffer(1, c.sampleRate * 6, c.sampleRate),
        data = b.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.02 * white) / 1.02;
        data[i] = brown * 3.5;
      }
      this.source = c.createBufferSource();
      this.source.buffer = b;
      this.source.loop = true;
      this.filter = c.createBiquadFilter();
      this.filter.type = "lowpass";
      this.gain = c.createGain();
      this.gain.gain.value = 0;
      this.source.connect(this.filter);
      this.filter.connect(this.gain);
      this.gain.connect(c.destination);
      this.source.start();
    }
    this.set(kind, volume);
    await this.context.resume();
  }
  set(kind: "rain" | "wind" | "stream", volume: number) {
    if (!this.context || !this.filter || !this.gain) return;
    this.filter.frequency.setTargetAtTime(
      kind === "rain" ? 3800 : kind === "stream" ? 1700 : 500,
      this.context.currentTime,
      0.15,
    );
    this.filter.Q.value = kind === "stream" ? 0.8 : 0.3;
    this.gain.gain.setTargetAtTime(
      Math.min(1, Math.max(0, volume)) * 0.55,
      this.context.currentTime,
      0.1,
    );
  }
  async stop() {
    if (this.context) await this.context.suspend();
  }
  async close() {
    this.source?.stop();
    if (this.context) await this.context.close();
    this.context = null;
  }
}
