import { ZalgoPromise } from "zalgo-promise";
import { safeInterval } from "../common/safe-interval";
import { uniqueId } from "../common/unique-id";
import { Config } from "../config";
import { Logger, getErrorMessage } from "../logger";
import { ERROR_CODES, ERROR_MESSAGES } from "../logger/error-messages.constant";
import { UserChannelConfig } from "../types";
import {
  EditorBroadcastChannelNature,
  EditorRequestEventMessage,
} from "./broadcast-event.type";
import { EVENT_MANAGER_NAME, RESPONSE_CYCLE } from "./event-manager.constant";
import {
  OnEvent,
  RequestHandler,
  RequestListener,
  ResponseListener,
} from "./event-manager.type";
import { BroadcastMessenger } from "./broadcast-messenger";

/**
 * Manages the events and message communication between different windows or iframes.
 */
export class AdvancedBroadcastMessage {
  private requestMessageHandlers = new Map<string, RequestListener>();
  private responseMessageHandlers = new Map<string, ResponseListener>();
  private broadcastMessenger: BroadcastMessenger;
  private logger: Logger;
  private config: Config;

  constructor(channelId: string, options: UserChannelConfig = {}) {
    if (!channelId) {
      throw new Error(getErrorMessage(ERROR_MESSAGES.common.channelIdRequired));
    }
    this.config = new Config(channelId, options);
    this.logger = new Logger(this.config);
    this.broadcastMessenger = new BroadcastMessenger(this.logger, this.config);

    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.send = this.send.bind(this);
    this.on = this.on.bind(this);
    this.unregisterEvent = this.unregisterEvent.bind(this);

    this.broadcastMessenger.onMessage(this.handleIncomingMessage);
  }

  /**
   * Handle an incoming post message event
   * @param event The post message event containing details of the request
   * @returns A promise that resolves when the response is received
   */
  private async handleIncomingMessage(event: EditorRequestEventMessage) {
    const { type, channel, payload, eventManager, metadata, error } = event;

    if (
      eventManager !== EVENT_MANAGER_NAME ||
      channel !== this.config.get("channelId")
    ) {
      return;
    }

    const { hash, nature } = metadata;

    switch (nature) {
      case EditorBroadcastChannelNature.REQUEST: {
        this.logger.debug("REQUEST received", event);
        if (this.broadcastMessenger.isClosed) {
          this.logger.error(
            getErrorMessage(ERROR_MESSAGES.common.channelIsClosed)
          );
        }

        this.broadcastMessenger.sendAck({ type, hash });

        if (!this.requestMessageHandlers.has(type)) {
          this.logger.debug(
            getErrorMessage(
              ERROR_MESSAGES.receiveEvent.noRequestListenerFound(type)
            )
          );

          this.broadcastMessenger.sendResponse({
            type,
            hash,
            payload: undefined,
            error: {
              code: ERROR_CODES.receiveEvent.noRequestListenerFound,
              message: getErrorMessage(
                ERROR_MESSAGES.receiveEvent.noRequestListenerFound(type)
              ),
            },
          });
          return;
        }

        const { handler } = this.requestMessageHandlers.get(type)!;

        const handlerEvent: OnEvent = {
          data: payload,
        };

        return ZalgoPromise.all([
          ZalgoPromise.try(() => {
            return handler(handlerEvent);
          })
            .then((data) => {
              this.broadcastMessenger.sendResponse({
                type,
                hash,
                payload: data,
                error: undefined,
              });
            })
            .catch((err) => {
              this.logger.error(
                getErrorMessage(ERROR_MESSAGES.receiveEvent.codeReturnedError),
                err
              );
            }),
        ]);
      }
      case EditorBroadcastChannelNature.RESPONSE: {
        this.logger.debug("RESPONSE received", event);

        if (!this.responseMessageHandlers.has(hash)) {
          this.logger.error(
            getErrorMessage(
              ERROR_MESSAGES.receiveEvent.noResponseListenerFound(hash)
            )
          );
          return;
        }

        const responseListener = this.responseMessageHandlers.get(hash)!;

        if (error) {
          responseListener.promise.reject(error);
        } else {
          responseListener.promise.resolve(payload);
        }

        break;
      }
      case EditorBroadcastChannelNature.ACK: {
        this.logger.debug("ACK received", event);

        if (!this.responseMessageHandlers.has(hash)) {
          this.logger.error(
            getErrorMessage(
              ERROR_MESSAGES.receiveEvent.noAckListenerFound(hash)
            )
          );
          return;
        }

        const responseListener = this.responseMessageHandlers.get(hash)!;
        responseListener.hasReceivedAck = true;

        break;
      }
      default:
        this.logger.error(
          getErrorMessage(ERROR_MESSAGES.receiveEvent.unknownNature(nature)),
          event
        );
    }
  }

  /**
   * Send an event to the target window
   * @param type The type of event to send
   * @param payload The payload to send with the event
   *
   * @example
   * const eventManager = new EventManager("channel-id");
   *
   * const output = eventManager.send("my-event", { foo: "bar" });
   * console.log(output) // { foo: "bar1" }
   */
  async send<ReturnType = undefined>(type: string, payload?: any) {
    const promise = new ZalgoPromise<ReturnType>();
    const hash = uniqueId(type);

    const responseListener: ResponseListener = {
      type,
      promise,
      hasCancelled: false,
      hasReceivedAck: false,
    };

    this.responseMessageHandlers.set(hash, responseListener);

    const totalAllowedAckTime = 1000;
    let ackTimeLeft = totalAllowedAckTime;

    const interval = safeInterval(() => {
      if (this.broadcastMessenger.isClosed) {
        return promise.reject(
          new Error(getErrorMessage(ERROR_MESSAGES.common.channelIsClosed))
        );
      }

      // TODO: raise this event
      // if (responseListener.hasCancelled) {
      //     return promise.reject(
      //         new Error(
      //             getErrorMessage(ERROR_MESSAGES.sendEvent.eventCancelled)
      //         )
      //     );
      // }

      ackTimeLeft = Math.max(ackTimeLeft - RESPONSE_CYCLE, 0);

      if (!responseListener.hasReceivedAck && ackTimeLeft <= 0) {
        return promise.reject(
          getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived)
        );
      }
    }, RESPONSE_CYCLE);

    promise
      .finally(() => {
        this.responseMessageHandlers.delete(hash);
        interval.cancel();
      })
      .catch((err) => {
        this.logger.debug(
          getErrorMessage(ERROR_MESSAGES.sendEvent.receiverReturnedError),
          err
        );
      });

    this.broadcastMessenger.sendRequest({
      type,
      hash,
      error: undefined,
      payload,
    });

    return promise;
  }

  /**
   * Register an event handler for a specific event type
   * @param type The type of event to listen for
   * @param handler The handler to call when the event is received
   * @returns An object with an unregister method to unregister the event
   *
   * @example
   * const eventManager = new EventManager("channel-id");
   *
   * const unregister = eventManager.on("my-event", (event) => {
   *  console.log("event received", event);
   *  return { foo: "bar1" };
   * });
   *
   * unregister();
   */
  on<Payload = unknown, ReturnType = any>(
    type: string,
    handler: RequestHandler<Payload, ReturnType>
  ) {
    if (this.requestMessageHandlers.has(type)) {
      this.logger.error(
        getErrorMessage(
          ERROR_MESSAGES.registerEvent.eventAlreadyRegistered(type)
        )
      );
    }

    const requestListener: RequestListener = {
      handler,
    };
    this.requestMessageHandlers.set(type, requestListener);

    return {
      unregister: () => {
        this.unregisterEvent(type);
      },
    };
  }

  /**
   * Unregister an event handler for a specific event type
   * @param type The type of event to unregister
   */
  private unregisterEvent(type: string) {
    if (!this.requestMessageHandlers.has(type)) {
      this.logger.error(
        getErrorMessage(ERROR_MESSAGES.unregisterEvent.eventDoesNotExist(type))
      );
    } else {
      this.logger.debug("Unregistering event", type);

      this.requestMessageHandlers.delete(type);
    }
  }

  /**
   * Destroy the event manager
   */
  destroy(config?: { soft?: boolean }) {
    this.requestMessageHandlers.clear();
    this.responseMessageHandlers.clear();

    if (!config?.soft) {
      this.broadcastMessenger.close();
    }
  }
}
