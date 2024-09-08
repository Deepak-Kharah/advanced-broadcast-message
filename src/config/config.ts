import { Path, PathValue } from "../common/util.type";
import { getErrorMessage } from "../logger";
import { ERROR_MESSAGES } from "../logger/error-messages.constant";
import { getDefaultConfig } from "./config.default";
import type { ChannelConfig, UserChannelConfig } from "./config.type";
import { get, set } from "lodash-es";

/**
 * Class responsible for handling the configuration settings.
 */
export class Config {
  private config: ChannelConfig;

  constructor(channelId: string, options: UserChannelConfig = {}) {
    this.config = updateConfig({ channelId, ...options });
  }

  /**
   * Sets a specific configuration key to the provided value.
   * @param key - The configuration key to set.
   * @param value - The value to set for the configuration key.
   */
  set<K extends Path<ChannelConfig>>(
    key: K,
    value: PathValue<ChannelConfig, K>,
  ): void {
    set(this.config, key, value);
  }

  /**
   * Retrieves the value of a specific configuration key.
   * @param key - The configuration key to retrieve the value for.
   * @returns The value of the configuration key.
   */
  get<K extends Path<ChannelConfig>>(key: K): PathValue<ChannelConfig, K> {
    return get(this.config, key) as PathValue<ChannelConfig, K>;
  }

  /**
   * Retrieves all user configurations.
   * @returns {ChannelConfig} The user configurations.
   */
  getAll(): ChannelConfig {
    return this.config;
  }

  /**
   * Resets the configuration to the default values.
   */
  reset(): void {
    this.config = getDefaultConfig();
  }
}

/**
 * Updates the configuration object with the provided partial configuration.
 * @param userInput - The partial configuration provided by the user.
 * @param config - The current configuration object.
 */
function updateConfig(
  userInput: UserChannelConfig & { channelId: string },
): ChannelConfig {
  if (userInput.channelId === "") {
    throw new Error(getErrorMessage(ERROR_MESSAGES.common.channelIdRequired));
  }

  const config = getDefaultConfig();
  config.channelId = userInput.channelId;
  const { debug, suppressErrors, ...channelConfig } = userInput;

  // * development configurations
  config.developmentConfig.debug = debug ?? config.developmentConfig.debug;

  config.developmentConfig.suppressErrors =
    suppressErrors ?? config.developmentConfig.suppressErrors;

  // * channel configurations
  config.channelConfig = channelConfig; // Since it will always be an object, we can directly assign it.

  return config;
}
