import { ERROR_MESSAGES } from "../../logger/error-messages.constant";
import { Config } from "../config";

describe("Config handler", () => {
  // it("should get initialized with default config", () => {
  //   const config = new Config().getAll();

  //   expect(config.targetWindow).not.toBeUndefined();
  //   //@ts-expect-error - simulate the deletion of the targetWindow property
  //   delete config.targetWindow;

  //   expect(config).toEqual({
  //     debug: false,
  //     channelId: "",
  //     suppressErrors: false,
  //     targetOrigin: "*",
  //   });
  // });

  it("should create a new config with the config provided", () => {
    let config = new Config("channel-id", {
      debug: true,
    });

    expect(config.get("developmentConfig.debug")).toBe(true);
    expect(config.get("developmentConfig.suppressErrors")).toBe(false);
    expect(config.get("channelId")).toBe("channel-id");
    expect(config.get("channelConfig.prepareDelay")).toBe(undefined);

    config = new Config("channel-id", {});

    expect(config.get("developmentConfig.debug")).toBe(false);
    expect(config.get("developmentConfig.suppressErrors")).toBe(false);
    expect(config.get("channelId")).toBe("channel-id");
    expect(config.get("channelConfig.prepareDelay")).toBe(undefined);

    config = new Config("channel-id", {
      debug: true,
      suppressErrors: true,
      prepareDelay: 1000,
      type: "simulate",
    });

    expect(config.get("developmentConfig.debug")).toBe(true);
    expect(config.get("developmentConfig.suppressErrors")).toBe(true);
    expect(config.get("channelId")).toBe("channel-id");
    expect(config.get("channelConfig.prepareDelay")).toBe(1000);
    expect(config.get("channelConfig.type")).toBe("simulate");
  });

  it("should throw an error if channelId is missing", () => {
    expect(() => {
      new Config("", {});
    }).toThrowError(ERROR_MESSAGES.common.channelIdRequired);
  });

  it("should set a new value for a specific key", () => {
    const config = new Config("channel-id", {
      debug: true,
    });

    expect(config.get("developmentConfig.debug")).toBe(true);
    config.set("developmentConfig.debug", false);
    expect(config.get("developmentConfig.debug")).toBe(false);

    expect(config.get("channelConfig.prepareDelay")).toBe(undefined);
    config.set("channelConfig.prepareDelay", 1000);
    expect(config.get("channelConfig.prepareDelay")).toBe(1000);
  });

  it("should get all the configurations", () => {
    const config = new Config("channel-id", {
      debug: true,
    });

    console.log(config.getAll());

    expect(config.getAll()).toEqual({
      channelId: "channel-id",
      developmentConfig: { debug: true, suppressErrors: false },
      channelConfig: { channelId: "channel-id" },
    });
  });

  it("should reset the configurations to default", () => {
    const config = new Config("channel-id", {
      debug: true,
    });

    expect(config.get("developmentConfig.debug")).toBe(true);
    config.reset();
    expect(config.get("developmentConfig.debug")).toBe(false);
  });
});
