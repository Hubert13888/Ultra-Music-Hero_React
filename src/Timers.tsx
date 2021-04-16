export class ExtendedTimer {
  isOff = false;
  pos = "run";
  timerId: number;
  start: number;
  remaining: number;

  constructor(private callback: () => void, private delay: number) {
    this.remaining = delay;
    this.resume();
  }

  pause = () => {
    window.clearTimeout(this.timerId);
    this.remaining -= Date.now() - this.start;
    this.pos = "stop";
  };

  resume = () => {
    this.start = Date.now();
    window.clearTimeout(this.timerId);
    this.timerId = window.setTimeout(this.callback, this.remaining);
    this.pos = "run";
  };
  setOff = () => {
    this.isOff = true;
  };
  getOff = () => {
    return this.isOff;
  };
}
