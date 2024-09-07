import { Config } from "../../config";
import { EVENT_MANAGER_NAME } from "../../event-manager/event-manager.constant";
import { Logger, getErrorMessage } from "../logger";

describe("Logger", () => {
  let logger: Logger;
  let config: Config;
  const TEST_MESSAGE = "test message";

  beforeEach(() => {
    config = new Config("channel-id", {});
    logger = new Logger(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should log a message with the prefix", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.log(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenCalledWith(EVENT_MANAGER_NAME, TEST_MESSAGE);
  });

  it("should log an info message with the prefix", () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    logger.info(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenCalledWith(EVENT_MANAGER_NAME, TEST_MESSAGE);
  });

  it("should log a debug message with the prefix if debug is set to true", () => {
    config.set("developmentConfig.debug", true);
    logger = new Logger(config);

    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    logger.debug(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenLastCalledWith(
      EVENT_MANAGER_NAME,
      "DEBUG:",
      TEST_MESSAGE,
      {}
    );
  });

  it("should not log a debug message with the prefix if debug is set to false", () => {
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    logger.debug(TEST_MESSAGE);

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should log an error message with the prefix", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenCalledWith(EVENT_MANAGER_NAME, TEST_MESSAGE);
  });

  it("should suppress error messages if suppressErrors is set to true", () => {
    config.set("developmentConfig.suppressErrors", true);

    logger = new Logger(config);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error(TEST_MESSAGE);

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

describe("getErrorMessage", () => {
  it("should return a string with the prefix", () => {
    expect(getErrorMessage("test message")).toBe(
      EVENT_MANAGER_NAME + ": test message"
    );
  });
});
