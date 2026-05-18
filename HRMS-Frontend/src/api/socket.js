import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
const subscriptions = {}; // track subscriptions to avoid duplicates

/* ---------------- CONNECT ---------------- */
export const connectSocket = (
  username,
  token,
  onPrivateMessage,
  onTask,
  onStatus,
  onCallSignal,
   onKpiUpdate   // ✅ ADD THIS
) => {
  // ✅ Prevent duplicate connections
  if (stompClient && stompClient.connected) {
    console.log("⚠️ WebSocket already connected, reusing existing connection");
    return;
  }

  // ✅ Deactivate stale client if exists
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
  // ✅ ADD THIS BLOCK HERE
if (!token) {
  console.error("❌ No token found for WebSocket");
  return;
}
  stompClient = new Client({
  webSocketFactory: () =>
  new SockJS(
    `${import.meta.env.VITE_API_BASE_URL}/ws?token=${token}`,
    null,
    {
      transports: ["websocket", "xhr-streaming", "xhr-polling"]
    }
  ),

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    reconnectDelay: 5000,

    debug: (str) => console.log("STOMP:", str),

    onConnect: () => {
      if (!subscriptions.claims) {
  subscriptions.claims = stompClient.subscribe(
    "/topic/claims",
    (msg) => {
      console.log("📩 Claim update received:", msg.body);

      // 👉 refresh UI instantly
      if (onStatus) onStatus(msg.body);

      // OR directly refetch claims
      // fetchClaims();
    }
  );
}
      console.log("✅ WebSocket connected");
      window.stompClient = stompClient;

       // ✅ ADD THIS HERE (IMPORTANT)
  if (!subscriptions.kpi) {
    subscriptions.kpi = stompClient.subscribe(
      "/topic/kpi-updates",
      (msg) => {
        const data = JSON.parse(msg.body);
        console.log("📊 KPI UPDATE 👉", data);

        if (onKpiUpdate) onKpiUpdate(data); // 🔥 trigger React update
      }
    );
  }

      // ✅ Private messages
      if (!subscriptions.messages) {
        subscriptions.messages = stompClient.subscribe(
          "/user/queue/messages",
          (msg) => {
            if (onPrivateMessage) onPrivateMessage(JSON.parse(msg.body));
          }
        );
      }

      // ✅ Tasks
      if (!subscriptions.tasks) {
        subscriptions.tasks = stompClient.subscribe(
          "/user/queue/tasks",
          (msg) => {
            if (onTask) onTask(JSON.parse(msg.body));
          }
        );
      }

      // ✅ Topic tasks (for task board updates)
      if (!subscriptions.topicTasks) {
        subscriptions.topicTasks = stompClient.subscribe(
          "/topic/tasks",
          (msg) => {
            if (onTask) onTask(JSON.parse(msg.body));
          }
        );
      }

      // ✅ Status
      if (!subscriptions.status) {
        subscriptions.status = stompClient.subscribe(
          "/topic/status",
          (msg) => {
            if (onStatus) onStatus(msg.body);
          }
        );
      }

      // ✅ Call signals — single subscription
      if (!subscriptions.call) {
        subscriptions.call = stompClient.subscribe(
          "/user/queue/call",
          (msg) => {
            const data = JSON.parse(msg.body);
            console.log("📞 Call signal received:", data.action);

            window.dispatchEvent(
              new CustomEvent("call_signal", { detail: data })
            );

            if (onCallSignal) onCallSignal(data);
          }
        );
      }
    },

    onDisconnect: () => {
      console.log("🔌 WebSocket disconnected");
      // Clear subscriptions on disconnect so they re-register on reconnect
      Object.keys(subscriptions).forEach((k) => delete subscriptions[k]);
    },

    onStompError: (frame) => {
      console.error("❌ STOMP ERROR", frame);
    },
  });

  stompClient.activate();
};

/* ---------------- DISCONNECT ---------------- */
export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    Object.keys(subscriptions).forEach((k) => delete subscriptions[k]);
    console.log("🔌 WebSocket manually disconnected");
  }

};

/* ---------------- CALL SIGNAL ---------------- */
export const sendCallSignal = (payload) => {
  if (!stompClient?.connected) {
    console.error("❌ STOMP not connected - cannot send call signal");
    return false;
  }

  stompClient.publish({
    destination: "/app/call.signal",
    body: JSON.stringify(payload),
  });

  return true;
};

/* ---------------- PRIVATE MESSAGE ---------------- */
export const sendMessageWS = (payload) => {
  if (!stompClient?.connected) return;

  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });
};

/* ---------------- GROUP ---------------- */
export const subscribeToGroup = (groupId, callback) => {
  if (!stompClient?.connected) return;

  const key = `group_${groupId}`;
  if (subscriptions[key]) return; // already subscribed

  subscriptions[key] = stompClient.subscribe(
    `/topic/group.${groupId}`,
    (msg) => {
      callback(JSON.parse(msg.body));
    }
  );
};

export const sendGroupMessageWS = (payload) => {
  if (!stompClient?.connected) return;

  stompClient.publish({
    destination: "/app/group.send",
    body: JSON.stringify(payload),
  });
};

/* ---------------- TASKS ---------------- */
export const sendTaskUpdate = (task) => {
  if (!stompClient?.connected) return;

  stompClient.publish({
    destination: "/app/task-update",
    body: JSON.stringify(task),
  });
};

export const sendTaskChat = (msg) => {
  if (!stompClient?.connected) return;

  stompClient.publish({
    destination: "/app/task-chat",
    body: JSON.stringify(msg),
  });
};

export const subscribeTaskChat = (taskId, callback) => {
  if (!stompClient?.connected) return;

  const key = `taskChat_${taskId}`;
  if (subscriptions[key]) return;

  subscriptions[key] = stompClient.subscribe(
    `/topic/task-chat/${taskId}`,
    (msg) => {
      callback(JSON.parse(msg.body));
    }
  );
};

/* ---------------- STATUS ---------------- */
export const sendStatus = (username) => {
  if (!stompClient?.connected) return;

  stompClient.publish({
    destination: "/app/user-status",
    body: username,
  });
};

/* ---------------- UTILS ---------------- */
export const isSocketConnected = () => !!stompClient?.connected;