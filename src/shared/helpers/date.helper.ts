export class DateHelper {
  static now() {
    return Date.now();
  }

  static currentTime() {
    return Math.floor(this.now() / 1000);
  }
}
