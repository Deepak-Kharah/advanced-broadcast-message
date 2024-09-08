# Advanced Broadcast message

The advanced broadcast message is a simple library that allows you to send messages between tabs of same origin.

This project uses the [Broadcast channel](https://github.com/pubkey/broadcast-channel) and made it promise based to receive response from the other tab.

> Note: The sender can receive only one response from the receiver. Hence, if you have multiple receiver, it will receive the response from the fastest responder.

<details>
<summary>Table of contents</summary>

- [Advanced Broadcast message](#advanced-broadcast-message)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Basic usage](#basic-usage)
    - [Returning values from the listener](#returning-values-from-the-listener)
    - [Debug mode](#debug-mode)
    - [Multiple channels](#multiple-channels)
    - [Typescript](#typescript)
  - [API](#api)
    - [AdvancedBroadcastMessage](#advancedbroadcastmessage)
      - [`new AdvancedBroadcastMessage(channelId: string, options: UserChannelConfig)`](#new-advancedbroadcastmessagechannelid-string-options-userchannelconfig)
      - [`advancedBroadcastMessage.send(type: string, payload?: any): Promise<any>`](#advancedbroadcastmessagesendtype-string-payload-any-promiseany)
      - [`advancedBroadcastMessage.on(type: string, listener: (event: MessageEvent) => any): { unregister(): void }`](#advancedbroadcastmessageontype-string-listener-event-messageevent--any--unregister-void-)

</details>

## Installation

You can install it using npm:

```bash
npm install advanced-broadcast-message
```

Or using yarn:

```bash
yarn add advanced-broadcast-message
```

Or using pnpm:

```bash
pnpm add advanced-broadcast-message
```

## Usage

### Basic usage

Initialize the `AdvancedBroadcastMessage` class with a channel id. You can use the `send` method to send messages to the other tab. You can use the `on` method to listen to messages from the other tab.

You can use the `AdvancedBroadcastMessage` class to send messages to the iframe.

```javascript
import AdvancedBroadcastMessage from "advanced-broadcast-message";

const advancedBroadcastMessage = new AdvancedBroadcastMessage("channel-id");

advancedBroadcastMessage.send("message", { data: "Hello, world!" });
```

Use the `AdvancedBroadcastMessage` class to receive messages in the same project.

```javascript
import AdvancedBroadcastMessage from "advanced-broadcast-message";

const advancedBroadcastMessage = new AdvancedBroadcastMessage("channel-id");

advancedBroadcastMessage.send("message", { data: "Hello, world!" });

advancedBroadcastMessage.on("message", (event) => {
  console.log(event.data); // { data: "Hello, world!" }
});
```

### Returning values from the listener

You can return a value from the listener, which will be sent back to the tab.

> Note: If you have more than two receiver, the fastest responder will be the one who will send the response back to the sender.

```javascript
import AdvancedBroadcastMessage from "advanced-broadcast-message";

const iframe = document.getElementById("iframe");
const advancedBroadcastMessage = new AdvancedBroadcastMessage("channel-id");

advancedBroadcastMessage.send("sum", { num1: 10, num2: 11 }).then((sum) => {
  console.log(sum); // 21
});

advancedBroadcastMessage.on("sum", (event) => {
  return event.data.num1 + event.data.num2;
});
```

### Debug mode

You can enable the debug mode to log the messages to the console.

```javascript
import AdvancedBroadcastMessage from "advanced-broadcast-message";

const iframe = document.getElementById("iframe");
const advancedBroadcastMessage = new AdvancedBroadcastMessage("channel-id", {
  debug: true,
});
```

### Multiple channels

You can use the same `AdvancedBroadcastMessage` class to communicate with multiple iframes. You can create a new instance of the `AdvancedBroadcastMessage` class with a different channel id.

Even if the events have the same type, they will not interfere with each other.

```javascript
import AdvancedBroadcastMessage from "advanced-broadcast-message";

const advancedBroadcastMessage1 = new AdvancedBroadcastMessage("channel-id-1");

const advancedBroadcastMessage2 = new AdvancedBroadcastMessage("channel-id-2");
```

### Typescript

This library is written in typescript, so it comes with its own types. You can use the types to get the type of the payload in the listener and the response from the `send` method.

```typescript
import AdvancedBroadcastMessage from "advanced-broadcast-message";

const advancedBroadcastMessage = new AdvancedBroadcastMessage("channel-id");

advancedBroadcastMessage.on<{ from: string }>("message", (event) => {
  const data = event.data;
  console.log(data.from); // Micheal

  return `Hello ${data.from}!`;
});

advancedBroadcastMessage
  .send<string>("message", { from: "Micheal" })
  .then((response) => {
    console.log(response); // Hello Micheal!
  });
```

## API

### AdvancedBroadcastMessage

#### `new AdvancedBroadcastMessage(channelId: string, options: UserChannelConfig)`

Create a new instance of the `AdvancedBroadcastMessage` class.

- `channelId` - The channel id to use for the communication.
- `options` - The options to use for the communication.
- `options.suppressErrors` - A boolean to suppress the error logs. If enabled, the class will not throw an error. This flag is useful when you have a library and you expect some errors. The value is set to `false` by default.
- `options.debug` - A boolean to enable or disable the debug mode. If enabled, the class will log the messages to the console.
- It also accepts all the options from the [Broadcast channel](https://github.com/pubkey/broadcast-channel) package.

#### `advancedBroadcastMessage.send(type: string, payload?: any): Promise<any>`

Send a message to another tab.

- `type` - The type of the message.
- `payload` - The payload of the message.
- Returns a promise that resolves with the response from the that tab.

#### `advancedBroadcastMessage.on(type: string, listener: (event: MessageEvent) => any): { unregister(): void }`

Listen to messages from another tab.

- `type` - The type of the message to listen to.
- `listener` - The listener to call when a message is received. The listener will receive the event object as an argument. The listener can return a value, which will be sent back to the sender tab.
- Returns an object with an `unregister` method to stop listening to messages.

```

```
