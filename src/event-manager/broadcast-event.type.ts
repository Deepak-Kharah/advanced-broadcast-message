import { EVENT_MANAGER_NAME } from "./event-manager.constant";

export enum EditorBroadcastChannelNature {
  ACK = "ACK",
  RESPONSE = "RESPONSE",
  REQUEST = "REQUEST",
}

export interface AdvBroadcastChannelErrorObject {
  code: string;
  message: string;
}
export interface EditorRequestEventMessage {
  eventManager: typeof EVENT_MANAGER_NAME;
  metadata: {
    hash: string;
    nature: EditorBroadcastChannelNature;
  };
  channel: string;
  payload: any;
  error: undefined | AdvBroadcastChannelErrorObject;
  type: string;
}

export interface BroadcastChannelSendOptions {
  hash: string;
  error: undefined | AdvBroadcastChannelErrorObject;
  payload: any;
  type: string;
}
