import { ChannelConfig } from "./config.type";

export function getDefaultConfig(): ChannelConfig {
  return {
    channelId: "",
    developmentConfig: {
      debug: false,
      suppressErrors: false,
    },
    channelConfig: {},
  };
}
