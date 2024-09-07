import { BroadcastChannelOptions } from "broadcast-channel";

export interface ChannelConfig {
  channelId: string;
  developmentConfig: DevelopmentConfig;
  channelConfig: BroadcastChannelOptions;
}

export interface DevelopmentConfig {
  /**
   * @default false
   */
  debug: boolean;
  /**
   * @default false
   */
  suppressErrors: boolean;
}

export type UserChannelConfig = Partial<DevelopmentConfig> &
  Partial<BroadcastChannelOptions>;
