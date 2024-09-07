import { safeInterval } from "../safe-interval";

describe("safeInterval", () => {
  vi.useFakeTimers();

  it("should call the method every specified time interval", () => {
    const mockMethod = vi.fn();
    const interval = safeInterval(mockMethod, 1000);

    vi.advanceTimersByTime(1000);
    expect(mockMethod).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(mockMethod).toHaveBeenCalledTimes(2);

    interval.cancel();
  });

  it("should cancel the interval when cancel is called", () => {
    const mockMethod = vi.fn();
    const interval = safeInterval(mockMethod, 1000);

    vi.advanceTimersByTime(1000);
    expect(mockMethod).toHaveBeenCalledTimes(1);

    interval.cancel();

    vi.advanceTimersByTime(1000);
    expect(mockMethod).toHaveBeenCalledTimes(1);
  });
});
