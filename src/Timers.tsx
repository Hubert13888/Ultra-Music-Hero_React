export class ExtendedTimer {
  isOff = false;
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
  };

  resume = () => {
    this.start = Date.now();
    window.clearTimeout(this.timerId);
    this.timerId = window.setTimeout(this.callback, this.remaining);
  };
  setOff = () => {
    this.isOff = true;
  };
  getOff = () => {
    return this.isOff;
  };
}

/* IN DEVELOPMENT
export class ExtendedInterval {
  intervalId: number;
  start: number;
  remaining: number;

  constructor(private callback: () => void, private delay: number) {
    this.remaining = delay;
    this.resume();
  }

  pause = () => {
    window.clearTimeout(this.intervalId);
    this.remaining -= Date.now() - this.start;
  };

  resume = () => {
    this.start = Date.now();
    window.clearTimeout(this.intervalId);
    window.setInterval(() => {

    })
    this.timerId = window.setTimeout(this.callback, this.remaining);
  };
  clear = () => {
    window.clearTimeout(this.intervalId);
  };
}
*/
