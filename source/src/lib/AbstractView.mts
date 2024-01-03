export class AbstractView<T> {
  /**
   * By convention, `end` is not included within the view's contents.
   */
  constructor(
    public contents: T,
    public start: number,
    public end: number,
  ) {}

  get length() {
    return this.end - this.start;
  }

  /**
   * Create a new `View` using a new `start` value. The new `start` value must
   * be greater than the original `start` value and less than or equal to the
   * `end` value. If the new `start` value is less than or equal to the original
   * `start` value or greater than the `end` value, the original view is
   * returned.
   */
  newStart(this: AbstractView<T>, start: number): AbstractView<T> {
    if (start > this.start) {
      if (start <= this.end) {
        return new AbstractView<T>(this.contents, start, this.end);
      }
    }
    return this;
  }

  /**
   * Create a new `View` using a new `end` value. The new `end` value must be
   * greater than or equal to the `start` value and less than the original `end`
   * value. If the new `end` value is less than the `start` value or greater
   * than or equal to the original `end` value, the original view is returned.
   */
  newEnd(this: AbstractView<T>, end: number): AbstractView<T> {
    if (end >= this.start) {
      if (end < this.end) {
        return new AbstractView<T>(this.contents, this.start, end);
      }
    }
    return this;
  }

  /**
   * Create a new `View` using new `start` and `end` values. The new `start`
   * value must be greater than or equal to the original `start` value. The new
   * `end` value must be less than or equal to the original `end` value. The
   * `length` of the new view must be less than the `length` of the original
   * view; otherwise, the original view is returned.
   */
  newStartAndEnd(this: AbstractView<T>, start: number, end: number): AbstractView<T> {
    if (start >= this.start) {
      if (end <= this.end) {
        if (end - start < this.length) {
          return new AbstractView<T>(this.contents, start, end);
        }
      }
    }
    return this;
  }
}
