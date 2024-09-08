import { useEffect, useMemo, useState } from "react";

import AdvancedPostMessage from "advanced-broadcast-message";
import "./App.css";
import classNames from "classnames";
import { isMobile } from "./is-mobile";

const broadcastMessage = new AdvancedPostMessage("my-channel", {
  debug: true,
});

type Message = {
  message: string;
  id: string;
};

type MessageState =
  | {
      isSender: true;
      message: string;
      id: string;
      hasSeen: boolean;
    }
  | {
      isSender: false;
      message: string;
      id: string;
    };

function App() {
  const [messages, setMessages] = useState<MessageState[]>([]);
  const isMobileDevice = useMemo(() => isMobile(), []);

  useEffect(() => {
    broadcastMessage.on<Message>("draft-message", (event) => {
      const { message, id } = event.data;
      setMessages((prev) => [
        ...prev,
        {
          message,
          id,
          isSender: false,
        },
      ]);
      return id;
    });
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = data.get("message");

    if (!message) {
      return;
    }

    event.currentTarget.reset();

    const messageId = crypto.randomUUID();

    setMessages((prev) => [
      {
        message: message as string,
        id: messageId,
        isSender: true,
        hasSeen: false,
      },
      ...prev,
    ]);

    broadcastMessage
      .send<string>("draft-message", {
        message,
        id: messageId,
      })
      .then((id) => {
        setTimeout(() => {
          setMessages((prev) => {
            const newMessages = prev.map((msg) => {
              if (msg.id === id) {
                return {
                  ...msg,
                  hasSeen: true,
                };
              }
              return msg;
            });
            console.log(structuredClone(newMessages), id);
            return newMessages;
          });
        }, 500);
      });
  }

  return (
    <>
      <div className="container-sm">
        <h1 className="text-center mt-4">Advanced Broadcast Message</h1>
        <p className="text-center text-stone-700">
          It's the same old broadcast channel that now supports promises and
          responses.
        </p>
        {isMobileDevice && (
          <p className="text-center text-stack-red-500">
            You are on a mobile device. This app may not work as expected.
          </p>
        )}
      </div>
      <main>
        <section className="card">
          <div className="card-body">
            <div className="mb-4">
              <h2 className="cs24-subtitle mb-4">Step 1: Duplicate this tab</h2>
              <p className="cs24-body">
                You need to open two instances of this page to see the message
                in action. If you have only one tab open, you will only see the
                message you sent.
              </p>
            </div>

            <div className="mb-4">
              <h2 className="cs24-subtitle mb-4">Step 2: Send your message</h2>
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label" htmlFor="message">
                      Message
                    </label>
                    <input
                      type="text"
                      className="form-control form-field"
                      placeholder="Enter your message..."
                      name="message"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-outline-primary
            "
                >
                  Send Message
                </button>
              </form>
            </div>

            <div className="mt-4 text-justify text-stone-500">
              <p className="cs24-body">
                <small>
                  * This package can receive a response from the receiver.
                  However, if you have more than one receiver, it will only
                  receive the response from the first tab that responds.
                </small>
              </p>
            </div>
          </div>
        </section>
        <section className="card">
          <div className="card-body">
            <h2 className="cs24-subtitle mb-4">
              Step 3: See your messages here.
            </h2>

            <div className="p-2 h-10 message-list">
              <ul className="message-list">
                {messages.map((msg) => (
                  <li
                    className={classNames("card", {
                      "text-end": msg.isSender,
                      "bg-purple-50": !msg.isSender,
                      "text-purple-700": !msg.isSender,
                      "bg-parrot-50": msg.isSender && msg.hasSeen,
                      "text-parrot-700": msg.isSender && msg.hasSeen,
                      "bg-tangerine-50": msg.isSender && !msg.hasSeen,
                      "text-tangerine-700": msg.isSender && !msg.hasSeen,
                    })}
                    key={msg.id}
                  >
                    <div className={classNames("card-body")}>
                      <p>{msg.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 text-justify text-stone-500">
              <p className="cs24-body">
                <small>
                  You will see the message background changing to{" "}
                  <strong className="text-parrot-700">green</strong>, indicating
                  that the receiver has seen the message.
                </small>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
