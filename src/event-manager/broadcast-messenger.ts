import { BroadcastChannel, OnMessageHandler } from "broadcast-channel";
import { Config } from "../config";
import { Logger } from "../logger";
import {
  EditorBroadcastChannelNature,
  EditorRequestEventMessage,
  BroadcastChannelSendOptions,
} from "./broadcast-event.type";
import { EVENT_MANAGER_NAME } from "./event-manager.constant";
import { ERROR_MESSAGES } from "../logger/error-messages.constant";

export class BroadcastMessenger {
  private config: Config;
  private broadcastChannel: BroadcastChannel<EditorRequestEventMessage>;

  constructor(
    private logger: Logger,
    config: Config,
  ) {
    this.sendResponse = this.sendResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.sendAck = this.sendAck.bind(this);
    this.getMessage = this.getMessage.bind(this);

    this.config = config;
    this.broadcastChannel = new BroadcastChannel<EditorRequestEventMessage>(
      this.config.get("channelId"),
      this.config.get("channelConfig"),
    );
  }

  sendRequest(config: BroadcastChannelSendOptions) {
    const completeConfig = {
      ...config,
      nature: EditorBroadcastChannelNature.REQUEST,
    };
    this.logger.debug("Sending REQUEST", completeConfig);

    const message = this.getMessage(completeConfig);
    this.broadcastChannel.postMessage(message);
  }

  sendResponse(config: BroadcastChannelSendOptions) {
    const completeConfig = {
      ...config,
      nature: EditorBroadcastChannelNature.RESPONSE,
    };
    this.logger.debug("Sending RESPONSE", completeConfig);

    const message = this.getMessage(completeConfig);
    this.broadcastChannel.postMessage(message);
  }

  sendAck(config: Omit<BroadcastChannelSendOptions, "payload" | "error">) {
    const completeConfig = {
      ...config,
      payload: undefined,
      error: undefined,
      nature: EditorBroadcastChannelNature.ACK,
    };
    this.logger.debug("Sending ACK", completeConfig);

    const message = this.getMessage(completeConfig);
    this.broadcastChannel.postMessage(message);
  }

  private getMessage(
    config: BroadcastChannelSendOptions & {
      nature: EditorBroadcastChannelNature;
    },
  ): EditorRequestEventMessage {
    const { nature, hash, payload, type, error } = config;
    return {
      eventManager: EVENT_MANAGER_NAME,
      metadata: {
        hash,
        nature,
      },
      channel: this.config.get("channelId"),
      error,
      payload,
      type,
    };
  }

  onMessage(handler: OnMessageHandler<EditorRequestEventMessage>) {
    if (this.broadcastChannel.isClosed) {
      throw new Error(ERROR_MESSAGES.common.channelIsClosed);
    }

    this.broadcastChannel.onmessage = handler;
  }

  get isClosed() {
    return this.broadcastChannel.isClosed;
  }

  close() {
    this.broadcastChannel.close();
  }
}
