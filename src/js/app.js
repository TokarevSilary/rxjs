import { ajax } from "rxjs/ajax";
import { catchError, of, interval, switchMap, startWith } from "rxjs";
import { createElement } from "./render";

const root = document.getElementById("root");
const messagesContainer = createElement("div", { className: "messages" });
const rootContainer = createElement(
  "div",
  { className: "root" },
  createElement("h2", { className: "messages-type" }, "Incoming"),
  messagesContainer,
);

root.replaceWith(rootContainer);

function messageRender(data) {
  return createElement(
    "div",
    { className: "messages-cover" },
    createElement("p", { className: "message-mail" }, data.mail),
    createElement("p", { className: "message-subject" }, data.subject),
    createElement("div", { className: "message-time" }, data.time),
  );
}

const messagesUnread = interval(10000).pipe(
  startWith(0),
  switchMap(() =>
    ajax
      .getJSON(
        "https://rxjs-server-fake-messages.onrender.com/messages/unread",
      )
      .pipe(
        catchError(() => {
          return of({
            status: "not ok",
            timestamp: Math.floor(Date.now() / 1000),
            messages: [],
          });
        }),
      ),
  ),
);

messagesUnread.subscribe({
  next: (value) => drawUnreadMessages(value),
  error: (err) => console.log(err),
});

function drawUnreadMessages(response) {
  if (response.messages.length === 0) return;
  console.log(response);
  response.messages.forEach((message) => {
    const subject =
      message.subject.length > 15
        ? message.subject.slice(0, 15) + "..."
        : message.subject;
    const mail = message.from;
    const time = new Date(message.received * 1000);
    const hour = String(time.getHours()).padStart(2, "0");
    const minute = String(time.getMinutes()).padStart(2, "0");
    const day = String(time.getDate()).padStart(2, "0");
    const month = String(time.getMonth() + 1).padStart(2, "0");
    const year = time.getFullYear();
    const messageTime = `${hour}:${minute} ${day}.${month}.${year}`;
    const data = {
      subject: subject,
      mail: mail,
      time: messageTime,
    };
    messagesContainer.prepend(messageRender(data));
  });
}
