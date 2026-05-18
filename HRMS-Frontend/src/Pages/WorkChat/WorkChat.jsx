import { useContext, useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./WorkChat.css";

import { AuthContext } from "../../Context/Authcontext";
import { useCall } from "../../Context/CallContext";

/* COMPONENTS */
import ChatSidebar from "./Compo/ChatSidebar";
import ChatHeader from "./Compo/ChatHeader";
import ChatMessages from "./Compo/ChatMessages";
import ChatComposer from "./Compo/ChatComposer";
import CreateGroupModal from "./Compo/CreateGroupModal";
import GroupMembersPanel from "./Compo/GroupMemberPanel";
import CallScreen from "./Compo/CallScreen";

/* 🆕 MEETINGS */
import MeetingsContainer from "./Compo/Meetings/MeetingsContainer";
import MeetingRoom from "./Compo/Meetings/MeetingRoom";

/* SOCKET */
import {
  connectSocket,
  setPrivateMessageHandler,
  sendMessageWS,
  subscribeToGroup,
  sendGroupMessageWS,
  sendEditMessageWS
} from "../../api/socket";
import TokenManager from "../../Utils/tokenManager";

/* API */
import { fetchChatMessages, markChatMessagesSeen, fetchUnreadUsersCount, fetchUnreadMessagesPerUser, fetchLastMessage } from "../../api/chatapi";
import { fetchChatUsers } from "../../api/chatUsersApi";
import {
  fetchMyGroups,
  fetchGroupMessages,
  markGroupMessagesSeen,
  fetchUnreadGroupsCount,
  fetchUnreadMessagesPerGroup,
} from "../../api/GroupChatApi";

export default function WorkChat() {
  const { user, token } = useContext(AuthContext);
  
  // Use global call context
  const { call, incomingCall, callState, startCall, endCall, acceptCall, rejectCall } = useCall();
<<<<<<< HEAD

  // Normalize unread-per-user map keys to lowercase so lookups always work
  // regardless of how the backend returns email casing
  const normalizeUnreadKeys = (data) => {
    if (!data || typeof data !== 'object') return {};
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k.trim().toLowerCase(), v])
    );
  };
=======
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6

  // Try multiple ways to get the logged-in user's email
  const LOGGED_IN_EMAIL = (() => {
    if (user?.email) return user.email.trim().toLowerCase();
    if (user?.userEmail) return user.userEmail.trim().toLowerCase();
    
    try {
      const storedUser = localStorage.getItem('loggedUser');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const email = parsed.email || parsed.userEmail;
        return email ? email.trim().toLowerCase() : null;
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return null;
  })();
  
  const TOKEN = token;

  // Early return if no user email is available
  if (!LOGGED_IN_EMAIL) {
    console.error('❌ No user email available. User must be logged in.');
    return (
      <div className="wc-root modern-bg">
        <div className="wc-empty">
          Please log in to access Work Chat
        </div>
      </div>
    );
  }

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadUsersCount, setUnreadUsersCount] = useState(0);
  const [unreadGroupsCount, setUnreadGroupsCount] = useState(0);
  const [unreadPerUser, setUnreadPerUser] = useState({});
  const [unreadPerGroup, setUnreadPerGroup] = useState({});
  
  const [msgSearch, setMsgSearch] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showMeetings, setShowMeetings] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);

  // ── Active meeting — lives here so it survives calendar panel close ────────
  const [activeMeeting, setActiveMeeting]   = useState(null);
  const [meetingStompClient, setMeetingStompClient] = useState(null);
  const meetingStompRef  = useRef(null);
  const meetingOwnedRef  = useRef(false);

  // Spin up / reuse a STOMP client whenever a meeting is active
  useEffect(() => {
    if (!activeMeeting) return;
    if (meetingStompRef.current?.connected) {
      setMeetingStompClient(meetingStompRef.current);
      return;
    }
    if (window.stompClient?.connected) {
      meetingStompRef.current = window.stompClient;
      meetingOwnedRef.current = false;
      setMeetingStompClient(window.stompClient);
      return;
    }
    const tok = token || localStorage.getItem("token");
    if (!tok) return;
    const wsBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";
    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBase}/ws`),
      connectHeaders: { Authorization: `Bearer ${tok}` },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => { meetingStompRef.current = client; meetingOwnedRef.current = true; setMeetingStompClient(client); },
      onDisconnect: () => setMeetingStompClient(null),
    });
    client.activate();
    return () => {
      if (meetingOwnedRef.current && meetingStompRef.current) {
        meetingStompRef.current.deactivate();
        meetingOwnedRef.current = false;
      }
      meetingStompRef.current = null;
      setMeetingStompClient(null);
    };
  }, [activeMeeting, token]);

  const selectedChatRef = useRef(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const handleDelete = async (msg) => {
    const isMe = msg?.senderEmail?.toLowerCase() === LOGGED_IN_EMAIL?.toLowerCase();
    
    // Show delete modal only if sender
    if (isMe) {
      setMessageToDelete(msg);
      setShowDeleteModal(true);
    } else {
      // Non-sender can only delete for themselves
      performDelete(msg, false);
    }
  };

  const performDelete = async (msg, deleteForAll) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/chat/delete/${msg.id}?deleteForAll=${deleteForAll}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      
      if (deleteForAll) {
        setMessages(prev => prev.map(m => m.id === msg.id ? {...m, deleted: true, content: "", fileUrl: null} : m));
      } else {
        // Hide from current user's view only
        setMessages(prev => prev.filter(m => m.id !== msg.id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
    
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

const handleEdit = async (msg) => {
  const newText = prompt("Edit message", msg.content);
  if (!newText || newText.trim() === msg.content) return;

  const trimmed = newText.trim();

  try {
    // 1. Save to database via REST
    await fetch(`${import.meta.env.VITE_API_URL}/chat/edit/${msg.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(trimmed),
    });

    // 2. Update local UI immediately (sender side)
    setMessages(prev => prev.map(m =>
      m.id === msg.id ? { ...m, content: trimmed, edited: true } : m
    ));

    // 3. Notify receiver via WebSocket so their UI updates in real-time
    sendEditMessageWS({
      id:            msg.id,
      senderEmail:   msg.senderEmail,
      receiverEmail: msg.receiverEmail,
      content:       trimmed,
      edited:        true,
    });

  } catch (err) {
    console.error('Edit failed:', err);
    alert('Failed to edit message. Please try again.');
  }
};

const handleForward = (msg) => {
  setForwardMessage(msg);
  setShowForwardModal(true);
};

const confirmForward = async (recipientEmail) => {
  if (!forwardMessage || !recipientEmail) return;

  try {
    if (forwardMessage.fileUrl && !forwardMessage.fileUrl.startsWith('blob:')) {
      // ── Forward a file message ──────────────────────────────────────────
      // Fetch the file from the server and re-upload it to the new recipient
      const fileResponse = await fetch(
        forwardMessage.fileUrl.startsWith('http')
          ? forwardMessage.fileUrl
          : `${import.meta.env.VITE_API_BASE_URL}${forwardMessage.fileUrl}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      if (fileResponse.ok) {
        const blob = await fileResponse.blob();
        const file = new File([blob], forwardMessage.fileName || 'file', {
          type: forwardMessage.fileType || blob.type
        });

        const formData = new FormData();
        formData.append('senderEmail', LOGGED_IN_EMAIL);
        formData.append('receiverEmail', recipientEmail);
        formData.append('text', forwardMessage.content || '');
        formData.append('files', file);

        await fetch(`${import.meta.env.VITE_API_URL}/chat/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${TOKEN}` },
          body: formData,
        });
      } else {
        // File fetch failed — forward as text with filename reference
        sendMessageWS({
          senderEmail:  LOGGED_IN_EMAIL,
          receiverEmail: recipientEmail,
          content: `📎 ${forwardMessage.fileName || 'File'} (forwarded)`,
        });
      }
    } else {
      // ── Forward a text message ──────────────────────────────────────────
      sendMessageWS({
        senderEmail:   LOGGED_IN_EMAIL,
        receiverEmail: recipientEmail,
        content:       forwardMessage.content || '',
      });
    }

    setForwardMessage(null);
    setShowForwardModal(false);
  } catch (err) {
    console.error('Forward failed:', err);
    alert('Failed to forward message. Please try again.');
  }
};

const handleReply = (msg) => {
  setReplyMessage(msg);
};

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    setShowMembers(false);
  }, [selectedChat]);

<<<<<<< HEAD
  // Register the private message handler — separate from the connection so it
  // always points to the latest closure regardless of when the socket connected.
  useEffect(() => {
    if (!TOKEN || !LOGGED_IN_EMAIL) return;

    const handlePrivateMessage = (incomingMsg) => {
      const current = selectedChatRef.current;
      const senderEmail = incomingMsg.senderEmail?.toLowerCase();

      console.log("📨 WorkChat received message:", incomingMsg);

      // ── Immediately increment unread badge if chat is not currently open ──
      const isChatOpen = current?.type === "USER" &&
        current?.email?.toLowerCase() === senderEmail;

      if (!isChatOpen && senderEmail && senderEmail !== LOGGED_IN_EMAIL?.toLowerCase()) {
        setUnreadPerUser(prev => {
          const prevCount = prev[senderEmail] || 0;
          if (prevCount === 0) {
            setUnreadUsersCount(c => c + 1);
          }
          return { ...prev, [senderEmail]: prevCount + 1 };
        });
      }

      // Refresh unread count from server (for accuracy)
      fetchUnreadUsersCount(LOGGED_IN_EMAIL, TOKEN)
        .then((count) => setUnreadUsersCount(count))
        .catch((err) => console.error("Failed to refresh unread count:", err));

      // Refresh unread per user
      fetchUnreadMessagesPerUser(LOGGED_IN_EMAIL, TOKEN)
        .then((data) => setUnreadPerUser(normalizeUnreadKeys(data)))
        .catch((err) => console.error("Failed to refresh unread per user:", err));

      // Update last message for the sender in users list
      if (incomingMsg.senderEmail !== LOGGED_IN_EMAIL) {
        setUsers(prevUsers => prevUsers.map(u =>
          u.email === incomingMsg.senderEmail
            ? { ...u, lastMessage: incomingMsg.content, lastMessageTime: incomingMsg.timestamp }
            : u
        ));
      }

      if (!current || current.type !== "USER") return;

      const isCurrentChat =
        (incomingMsg.senderEmail?.toLowerCase() === LOGGED_IN_EMAIL?.toLowerCase() &&
          incomingMsg.receiverEmail?.toLowerCase() === current.email?.toLowerCase()) ||
        (incomingMsg.senderEmail?.toLowerCase() === current.email?.toLowerCase() &&
          incomingMsg.receiverEmail?.toLowerCase() === LOGGED_IN_EMAIL?.toLowerCase());

      if (!isCurrentChat) return;

      // If this is an edited message, update the existing message in place
      if (incomingMsg.edited && incomingMsg.id) {
        setMessages(prev =>
          prev.map(m => m.id === incomingMsg.id
            ? { ...m, content: incomingMsg.content, edited: true, editedAt: incomingMsg.editedAt }
            : m
          )
        );
        return;
      }

      // Prevent duplicate new messages from self (already added optimistically)
      if (incomingMsg.senderEmail?.toLowerCase() === LOGGED_IN_EMAIL?.toLowerCase()) return;

      setMessages((prev) => {
        // Guard against duplicates
        if (incomingMsg.id && prev.some(m => m.id === incomingMsg.id)) return prev;
        return [...prev, incomingMsg];
      });
    };

    // Register the handler — this works whether the socket is already connected or not
    setPrivateMessageHandler(handlePrivateMessage);

    // Ensure the socket is connected (CallContext may have already done this)
    connectSocket(LOGGED_IN_EMAIL, TOKEN, handlePrivateMessage, () => {}, () => {}, () => {});

    // Cleanup: clear the handler when WorkChat unmounts
    return () => {
      setPrivateMessageHandler(null);
    };
  }, [TOKEN, LOGGED_IN_EMAIL]);
=======
  // Connect WebSocket for chat messages (CallContext handles call signals)
 useEffect(() => {
  if (!TOKEN || !LOGGED_IN_EMAIL || socketConnectedForChat.current) return;

  const connectForChat = async () => {
    try {
      const activeToken = await TokenManager.getValidToken();

      await connectSocket(
        LOGGED_IN_EMAIL,
        activeToken,

        (incomingMsg) => {
          const current = selectedChatRef.current;
          if (!current) return;

          const isCurrentChat =
            (incomingMsg.senderEmail === LOGGED_IN_EMAIL &&
              incomingMsg.receiverEmail === current.email) ||
            (incomingMsg.senderEmail === current.email &&
              incomingMsg.receiverEmail === LOGGED_IN_EMAIL);

          if (!isCurrentChat) return;

          // ❌ prevent duplicate
         if (
  incomingMsg.senderEmail === LOGGED_IN_EMAIL &&
  incomingMsg.receiverEmail === current?.email
) return;

          setMessages((prev) => [...prev, incomingMsg]);
        },

        () => {}, // onTask
        () => {}, // onStatus
        () => {}  // onChat
      );

      socketConnectedForChat.current = true;

    } catch (error) {
      console.error("WebSocket error:", error);
    }
  };

  connectForChat();
}, [TOKEN, LOGGED_IN_EMAIL]);

>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6


  useEffect(() => {
    if (!TOKEN || !LOGGED_IN_EMAIL) return;
    
    fetchChatUsers(TOKEN)
<<<<<<< HEAD
      .then(async (data) => {
        const filteredUsers = data.filter((u) => u.email && u.email !== LOGGED_IN_EMAIL);
        
        // Deduplicate by email to prevent React key warnings
        const uniqueUsers = Array.from(
          new Map(filteredUsers.map(u => [u.email?.toLowerCase(), u])).values()
        );
        
        // Fetch last message for each user from chat history
        const usersWithLastMessage = await Promise.all(
          uniqueUsers.map(async (user) => {
            try {
              const chatHistory = await fetchChatMessages(LOGGED_IN_EMAIL, user.email, TOKEN);
              const lastMsg = chatHistory && chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
              console.log(`Last message for ${user.email}:`, lastMsg); // Debug log
              return {
                ...user,
                lastMessage: lastMsg?.content || "",
                lastMessageTime: lastMsg?.timestamp || null
              };
            } catch (err) {
              console.error(`Error fetching messages for ${user.email}:`, err);
              return {
                ...user,
                lastMessage: "",
                lastMessageTime: null
              };
            }
          })
        );
        
        console.log("Users with last messages:", usersWithLastMessage); // Debug log
        setUsers(usersWithLastMessage);
=======
      .then((data) => {
        console.log("✅ fetchChatUsers returned:", data);
       setUsers(
  Array.from(
    new Map(
      (data || []).map((u) => {
        const email =
          u.email || u.userEmail || u.empEmail || "";
        return [email.toLowerCase(), u];
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
      })
    ).values()
  ).filter((u) => {
    const email =
      u.email || u.userEmail || u.empEmail || "";

    return email.toLowerCase() !== LOGGED_IN_EMAIL?.toLowerCase();
  })
);
      })
      .catch((err) => {
        console.error("❌ fetchChatUsers failed:", err);
        setUsers([]);
      });
  }, [TOKEN, LOGGED_IN_EMAIL]);

  // Fetch unread users count on mount and periodically
  useEffect(() => {
    if (!TOKEN || !LOGGED_IN_EMAIL) return;

    const fetchUnreadCount = () => {
      // Fetch total unread users count
      fetchUnreadUsersCount(LOGGED_IN_EMAIL, TOKEN)
        .then((count) => setUnreadUsersCount(count))
        .catch((err) => console.error("Failed to fetch unread count:", err));
      
      // Fetch unread messages per user
      fetchUnreadMessagesPerUser(LOGGED_IN_EMAIL, TOKEN)
        .then((data) => setUnreadPerUser(normalizeUnreadKeys(data)))
        .catch((err) => console.error("Failed to fetch unread per user:", err));
    };

    // Fetch immediately
    fetchUnreadCount();

    // Refresh every 5 seconds
    const interval = setInterval(fetchUnreadCount, 5000);

    return () => clearInterval(interval);
  }, [TOKEN, LOGGED_IN_EMAIL]);

  // Fetch unread groups count on mount and periodically
  useEffect(() => {
    if (!TOKEN) return;

    const fetchUnreadGroupCount = () => {
      // Fetch total unread groups count
      fetchUnreadGroupsCount(TOKEN)
        .then((count) => setUnreadGroupsCount(count))
        .catch((err) => console.error("Failed to fetch unread group count:", err));
      
      // Fetch unread messages per group
      fetchUnreadMessagesPerGroup(TOKEN)
        .then((data) => setUnreadPerGroup(data))
        .catch((err) => console.error("Failed to fetch unread per group:", err));
    };

    // Fetch immediately
    fetchUnreadGroupCount();

    // Refresh every 5 seconds
    const interval = setInterval(fetchUnreadGroupCount, 5000);

    return () => clearInterval(interval);
  }, [TOKEN]);

  useEffect(() => {
  // Only request if not already decided (not granted and not denied)
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}, []);
  
  useEffect(() => {
    if (!TOKEN) return;
    
    fetchMyGroups(TOKEN)
<<<<<<< HEAD
      .then(async (data) => {
        if (!data || data.length === 0) {
          setGroups([]);
          return;
        }
        
        // Fetch unread counts per group
        const unreadCounts = await fetchUnreadMessagesPerGroup(TOKEN).catch(() => ({}));
        
        // Fetch last message for each group
        const groupsWithLastMessage = await Promise.all(
          data.map(async (group) => {
            try {
              const groupMessages = await fetchGroupMessages(group.id, TOKEN);
              const lastMsg = groupMessages && groupMessages.length > 0 
                ? groupMessages[groupMessages.length - 1] 
                : null;
              
              console.log(`Last message for group ${group.name}:`, lastMsg); // Debug log
              
              return {
                ...group,
                lastMessage: lastMsg?.content || "",
                lastMessageTime: lastMsg?.createdAt || null,
                unread: unreadCounts[group.id] || 0
              };
            } catch (err) {
              console.error(`Error fetching messages for group ${group.name}:`, err);
              return {
                ...group,
                lastMessage: "",
                lastMessageTime: null,
                unread: unreadCounts[group.id] || 0
              };
            }
          })
        );
        
        console.log("Groups with last messages:", groupsWithLastMessage); // Debug log
        setGroups(groupsWithLastMessage);
      })
=======
      .then((data) => setGroups(data || []))
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
      .catch(() => setGroups([]));
  }, [TOKEN]);

  // Sync unread counts with groups when unreadPerGroup changes
  useEffect(() => {
    if (Object.keys(unreadPerGroup).length === 0) return;
    
    setGroups(prevGroups => prevGroups.map(group => ({
      ...group,
      unread: unreadPerGroup[group.id] || 0
    })));
  }, [unreadPerGroup]);

  useEffect(() => {
    if (!selectedChat || selectedChat.type !== "USER" || !TOKEN) return;
    setMessages([]);
    fetchChatMessages(
      LOGGED_IN_EMAIL,
      selectedChat?.email,
      TOKEN
    )
      .then((msgs) => {
        setMessages(msgs);
        
        // ── Immediately clear unread badge for this chat (Teams-style instant feedback)
        setUnreadPerUser(prev => {
          const next = { ...prev };
          const emailKey = selectedChat.email?.toLowerCase();
          if (emailKey && next[emailKey]) {
            delete next[emailKey];
          }
          return next;
        });
        setUnreadUsersCount(prev => Math.max(0, prev - 1));
        
        // Mark messages as seen in the database (will update backend)
        markChatMessagesSeen(
          LOGGED_IN_EMAIL,
          selectedChat.email,
          TOKEN
        )
          .then(() => {
            // Refresh unread count after marking messages as seen
            fetchUnreadUsersCount(LOGGED_IN_EMAIL, TOKEN)
              .then((count) => setUnreadUsersCount(count))
              .catch((err) => console.error("Failed to refresh unread count:", err));
            
            // Refresh unread per user
            fetchUnreadMessagesPerUser(LOGGED_IN_EMAIL, TOKEN)
              .then((data) => setUnreadPerUser(normalizeUnreadKeys(data)))
              .catch((err) => console.error("Failed to refresh unread per user:", err));
          })
          .catch((err) => console.error("Failed to mark messages as seen:", err));
      })
      .catch(() => setMessages([]));
  }, [selectedChat, TOKEN, LOGGED_IN_EMAIL]);

useEffect(() => {
  if (!selectedChat || selectedChat.type !== "GROUP" || !TOKEN) return;

  setMessages([]);
<<<<<<< HEAD

  // Use a ref to track the current group ID to prevent stale closures
  const currentGroupId = selectedChat.id;

  // Define the group message handler once so it can be reused by the retry logic
  const handleGroupMsg = (groupMsg) => {
    console.log("📨 Group message received:", groupMsg);
    
    // Ignore messages from other groups (safety check)
    if (groupMsg.groupId !== currentGroupId) {
      console.log("⚠️ Message from different group, ignoring");
      return;
    }
    
    // Refresh unread count when receiving a new group message
    fetchUnreadGroupsCount(TOKEN)
      .then((count) => setUnreadGroupsCount(count))
      .catch((err) => console.error("Failed to refresh unread group count:", err));

    // Refresh unread per group
    fetchUnreadMessagesPerGroup(TOKEN)
      .then((data) => setUnreadPerGroup(data))
      .catch((err) => console.error("Failed to refresh unread per group:", err));

    // Update last message for this group in the groups list
    setGroups(prevGroups => prevGroups.map(g =>
      g.id === currentGroupId
        ? {
            ...g,
            lastMessage: groupMsg.content || groupMsg.fileName || "📎 File",
            lastMessageTime: groupMsg.createdAt,
          }
        : g
    ));

    setMessages((prev) => {
      // Prevent duplicate by checking if message with same ID already exists
      if (groupMsg.id && prev.some((m) => m.id === groupMsg.id)) {
        console.log("⚠️ Duplicate group message detected, skipping:", groupMsg.id);
        return prev;
      }
      console.log("✅ Adding new group message to state");
      return [...prev, groupMsg];
    });
  };

  fetchGroupMessages(selectedChat.id, TOKEN)
    .then((msgs) => {
      setMessages(msgs);
      
      // ── Immediately clear group unread badge (Teams-style instant feedback)
      setUnreadPerGroup(prev => {
        const next = { ...prev };
        delete next[selectedChat.id];
        return next;
      });
      setUnreadGroupsCount(prev => Math.max(0, prev - 1));
      
      // Mark group messages as seen
      markGroupMessagesSeen(selectedChat.id, TOKEN)
        .then(() => {
          // Refresh unread group count after marking as seen
          fetchUnreadGroupsCount(TOKEN)
            .then((count) => setUnreadGroupsCount(count))
            .catch((err) => console.error("Failed to refresh unread group count:", err));
          
          // Refresh unread per group
          fetchUnreadMessagesPerGroup(TOKEN)
            .then((data) => setUnreadPerGroup(data))
            .catch((err) => console.error("Failed to refresh unread per group:", err));
        })
        .catch((err) => console.error("Failed to mark group messages as seen:", err));
    })
    .catch(() => setMessages([]));

  // 🔥 subscribe ONCE and cleanup — with retry if socket not yet connected
  console.log("🔌 Setting up group subscription for:", selectedChat.id);
  let unsubscribe = subscribeToGroup(selectedChat.id, handleGroupMsg);
  let retryTimer = null;

  if (!unsubscribe) {
    // Socket not connected yet — retry every 500ms until it is
    console.log("⏳ Socket not connected, will retry subscription...");
    retryTimer = setInterval(() => {
      const unsub = subscribeToGroup(selectedChat.id, handleGroupMsg);
      if (unsub) {
        console.log("✅ Group subscription successful after retry");
        unsubscribe = unsub;
        clearInterval(retryTimer);
        retryTimer = null;
      }
    }, 500);
  } else {
    console.log("✅ Group subscription successful");
  }

  return () => {
    // 🔥 VERY IMPORTANT (prevents duplicate subscriptions)
    console.log("🔌 Cleaning up group subscription for:", selectedChat.id);
    if (unsubscribe) unsubscribe();
    if (retryTimer) clearInterval(retryTimer);
  };

}, [selectedChat?.id, TOKEN]);  // ✅ ONLY depend on group id

const sendMessage = async (text, files, replyMessage) => {
  if (!selectedChat) return;

  /* =========================
     🔥 GROUP CHAT
  ========================= */
  if (selectedChat.type === "GROUP") {

    if (files && files.length > 0) {
      // Upload files via REST — backend saves, broadcasts to /topic/group.{id}
      // so handleGroupMsg will add the message for all subscribers including sender.
      const formData = new FormData();
      formData.append("senderName", user?.name || LOGGED_IN_EMAIL);
      if (text?.trim()) formData.append("text", text.trim());
      if (replyMessage)  formData.append("replyTo", JSON.stringify(replyMessage));
      files.forEach((f) => formData.append("files", f));

      console.log("📤 Uploading files to group:", selectedChat.id);
      console.log("   Files count:", files.length);
      console.log("   Sender name:", user?.name || LOGGED_IN_EMAIL);
      console.log("   Text:", text?.trim() || "(none)");
      console.log("   Token:", TOKEN ? "Present" : "MISSING");
      console.log("   URL:", `${import.meta.env.VITE_API_BASE_URL}/api/chat/groups/${selectedChat.id}/upload`);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/groups/${selectedChat.id}/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${TOKEN}` },
            body: formData,
          }
        );
        
        console.log("📥 Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Group file upload failed:", response.status, errorText);
          alert(`Failed to upload file: ${response.status} ${response.statusText}\n${errorText}`);
        } else {
          const result = await response.json();
          console.log("✅ Group file upload successful:", result);
        }
      } catch (err) {
        console.error("❌ Group file upload error:", err);
        alert(`Failed to upload file: ${err.message}`);
      }
    } else if (text?.trim()) {
      // Text-only — send via WebSocket
      sendGroupMessageWS({
        groupId: selectedChat.id,
        senderEmail: LOGGED_IN_EMAIL,
        senderName: user?.name || LOGGED_IN_EMAIL,
        content: text,
        replyTo: replyMessage || null,
      });
    }

    return;
  }

  /* =========================
     🔥 PRIVATE CHAT (YOUR OLD)
  ========================= */
  const tempMessages = [];

  if (files && files.length > 0) {
    files.forEach((file) => {
      tempMessages.push({
        senderEmail: LOGGED_IN_EMAIL,
        receiverEmail: selectedChat.email,
        content: text || "",
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        timestamp: new Date().toISOString(),
        replyTo: replyMessage || null,
      });
    });
  } else if (text.trim()) {
    tempMessages.push({
=======

  fetchGroupMessages(selectedChat.id, TOKEN)
    .then(setMessages)
    .catch(() => setMessages([]));

  // 🔥 subscribe ONCE and cleanup
  const unsubscribe = subscribeToGroup(selectedChat.id, (groupMsg) => {
    setMessages((prev) =>
      prev.some((m) => m.id === groupMsg.id)
        ? prev // ❌ prevent duplicate
        : [...prev, groupMsg]
    );
  });

  return () => {
    // 🔥 VERY IMPORTANT (prevents duplicate subscriptions)
    if (unsubscribe) unsubscribe();
  };

}, [selectedChat?.id]);  // ✅ ONLY depend on group id

const sendMessage = async (text, files) => {
  if (!selectedChat) return;

  /* =========================
     🔥 GROUP CHAT (FIXED)
  ========================= */
  if (selectedChat.type === "GROUP") {

    const tempMessage = {
      // id: Date.now(),
      groupId: selectedChat.id,
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
      senderEmail: LOGGED_IN_EMAIL,
      senderName: user?.name || LOGGED_IN_EMAIL,
      content: text,
<<<<<<< HEAD
      timestamp: new Date().toISOString(),
      replyTo: replyMessage || null,
=======
      id: "temp-" + Date.now(),
timestamp: new Date().toISOString(),
    };

    

    // ✅ SEND VIA SOCKET
    sendGroupMessageWS({
      groupId: selectedChat.id,
      senderEmail: LOGGED_IN_EMAIL,
      senderName: user?.name || LOGGED_IN_EMAIL,
      content: text,
    });

    return;
  }

  /* =========================
     🔥 PRIVATE CHAT (YOUR OLD)
  ========================= */
  const tempMessages = [];

  if (files && files.length > 0) {
    files.forEach((file) => {
      tempMessages.push({
        senderEmail: LOGGED_IN_EMAIL,
        receiverEmail: selectedChat?.email,
        content: text || "",
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        timestamp: new Date().toISOString(),
      });
    });
  } else if (text.trim()) {
    tempMessages.push({
      senderEmail: LOGGED_IN_EMAIL,
      receiverEmail: selectedChat?.email,
      content: text,
      timestamp: new Date().toISOString(),
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
    });
  }

  setMessages((prev) => [...prev, ...tempMessages]);
<<<<<<< HEAD
  
  // Update last message in users list for sender
  console.log("Updating last message for sent message to:", selectedChat.email, "Content:", text || "File");
  setUsers(prevUsers => prevUsers.map(u => 
    u.email === selectedChat.email 
      ? { ...u, lastMessage: text || "File", lastMessageTime: new Date().toISOString() }
      : u
  ));
=======
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6

  try {
    if (files && files.length > 0) {
      const formData = new FormData();

      formData.append("senderEmail", LOGGED_IN_EMAIL);
<<<<<<< HEAD
      formData.append("receiverEmail", selectedChat.email);
      formData.append("text", text || "");
      
      // Include replyTo if replying to a message
      if (replyMessage) {
        formData.append("replyTo", JSON.stringify(replyMessage));
      }
=======
      formData.append("receiverEmail", selectedChat?.email);
      formData.append("text", text || "");
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6

      files.forEach((f) => formData.append("files", f));

      await fetch(`${import.meta.env.VITE_API_URL}/chat/upload`, {
<<<<<<< HEAD
=======
        
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        body: formData,
      });
<<<<<<< HEAD
    } else {
      sendMessageWS({
        senderEmail: LOGGED_IN_EMAIL,
        receiverEmail: selectedChat.email,
        content: text,
        replyTo: replyMessage || null,
=======

      // 🔥 force refresh messages after upload
fetchChatMessages(
  LOGGED_IN_EMAIL,
  selectedChat?.email,
  TOKEN
).then(setMessages);
    } else {
      sendMessageWS({
        senderEmail: LOGGED_IN_EMAIL,
        receiverEmail: selectedChat?.email,
        content: text,
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
      });
    }
  } catch (err) {
    console.error("Send failed", err);
  }
};

  /* 📞 CALL FUNCTIONS - Now using global context */
  const handleStartCall = (type) => {
    if (!selectedChat) {
      alert('Please select a chat to call');
      return;
    }

<<<<<<< HEAD
    if (selectedChat.type === "USER") {
      // ── 1-on-1 call ──────────────────────────────────────────────────────
      startCall(type, {
        email: selectedChat.email,
        name: selectedChat.name || selectedChat.email
      });
    } else if (selectedChat.type === "GROUP") {
      // ── Group call: call all members except self ──────────────────────────
      const memberEmails = (selectedChat.memberEmails || [])
        .filter(email => email && email.toLowerCase() !== LOGGED_IN_EMAIL.toLowerCase());

      if (memberEmails.length === 0) {
        alert('No other members in this group to call');
        return;
      }

      // Start call to the first member, then add the rest as participants
      const firstMember = memberEmails[0];
      const firstMemberUser = users.find(u => u.email && u.email.toLowerCase() === firstMember.toLowerCase());

      startCall(type, {
        email: firstMember,
        name: firstMemberUser?.name || firstMember.split('@')[0],
        isGroupCall: true,
        groupId: selectedChat.id,
        groupName: selectedChat.name,
        // Additional members to invite after first accepts
        additionalMembers: memberEmails.slice(1).map(email => {
          const u = users.find(u2 => u2.email && u2.email.toLowerCase() === email.toLowerCase());
          return { email, name: u?.name || email.split('@')[0] };
        })
      });
    }
=======
    startCall(type, {
      email: selectedChat?.email,
      name: selectedChat.name || selectedChat?.email
    });
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
  };

  const filteredMessages = messages.filter((m) =>
    m.content?.toLowerCase().includes(msgSearch.toLowerCase())
  );

  /* ========== RENDER ========== */
  return (
    <div className="wc-root modern-bg">
<<<<<<< HEAD
      {/* 📞 CALL SCREEN - Floating draggable window, chat stays visible behind it */}
      {(call || incomingCall) && (
        <CallScreen
          user={
            call?.user || {
              email: incomingCall?.fromEmail,
              name: incomingCall?.fromName || incomingCall?.fromEmail,
            }
          }
          type={call?.type || incomingCall?.type || 'voice'}
          onEnd={endCall}
          onAccept={incomingCall && !call ? acceptCall : undefined}
          onReject={incomingCall && !call ? rejectCall : undefined}
          isInitiator={call?.isInitiator ?? false}
          callId={call?.callId || incomingCall?.callId}
          waitingForAccept={call?.waitingForAccept ?? false}
          callState={callState}
          currentUserEmail={LOGGED_IN_EMAIL}
=======
      {/* 📞 CALL SCREEN - Shows when there's an active call */}
      {(call || incomingCall) && (
        <CallScreen
          user={call?.user || {
            email: incomingCall?.fromEmail,
            name: incomingCall?.fromName || incomingCall?.fromEmail
          }}
          type={call?.type || incomingCall?.type}
          onEnd={call ? endCall : rejectCall}
          onAccept={!call && incomingCall ? acceptCall : undefined}
          onReject={!call && incomingCall ? rejectCall : undefined}
          isInitiator={call?.isInitiator || false}
          callId={call?.callId || incomingCall?.callId}
          waitingForAccept={call?.waitingForAccept || (!!incomingCall && !call)}
          callState={callState}
          currentUserEmail={LOGGED_IN_EMAIL}
          onSignal={(signal) => {
            const toEmail = call?.user?.email || incomingCall?.fromEmail;
            if (!toEmail) {
              console.warn('Unable to send signal, missing recipient email', { signal, call, incomingCall });
              return;
            }
            console.log('📡 Sending WebRTC signal via WebSocket:', signal);
            sendCallSignal({
              ...signal,
              fromEmail: LOGGED_IN_EMAIL,
              toEmail
            });
          }}
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6
        />
      )}

      {/* 🎥 MEETING ROOM — portal-rendered, survives calendar panel close */}
      {activeMeeting && meetingStompClient && createPortal(
        <MeetingRoom
          meeting={activeMeeting}
          stompClient={meetingStompClient}
          onClose={() => setActiveMeeting(null)}
        />,
        document.body
      )}
      {activeMeeting && !meetingStompClient && createPortal(
        <div style={{
          position: "fixed", inset: 0, background: "#111", zIndex: 9000,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 16, color: "#fff",
          fontFamily: "'Segoe UI', sans-serif",
        }}>
          <div className="jmp-spinner" />
          <p>Connecting to meeting server…</p>
          <button onClick={() => setActiveMeeting(null)} style={{
            padding: "8px 20px", background: "#333", border: "none",
            borderRadius: 6, color: "#fff", cursor: "pointer",
          }}>Cancel</button>
        </div>,
        document.body
      )}

      {/* MAIN CHAT UI - Always visible (call window floats on top) */}
      <>
          {/* DELETE MESSAGE MODAL */}
          {showDeleteModal && messageToDelete && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>Delete Message</h3>
                <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>Choose how you want to delete this message:</p>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <button
                    onClick={() => performDelete(messageToDelete, false)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      transition: 'background-color 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  >
                    🗑 Delete only for me
                  </button>
                  <button
                    onClick={() => performDelete(messageToDelete, true)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#fff',
                      transition: 'background-color 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                  >
                    ⚠️ Delete for everyone
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setMessageToDelete(null);
                    }}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORWARD MESSAGE MODAL */}
          {showForwardModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                width: '90%',
                maxWidth: '400px',
                maxHeight: '500px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Forward Message To</h3>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  marginBottom: '15px',
                  border: '1px solid #eee',
                  borderRadius: '8px'
                }}>
                  {users.filter(u => u.email !== LOGGED_IN_EMAIL).map(user => (
                    <div
                      key={user.email}
                      onClick={() => confirmForward(user.email)}
                      style={{
                        padding: '12px 15px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: '500', color: '#333' }}>{user.name || user.email}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{user.email}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setShowForwardModal(false);
                    setForwardMessage(null);
                  }}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#666'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <ChatSidebar
            users={users}
            groups={groups}
            selectedChat={selectedChat}
            onSelectUser={setSelectedChat}
            onSelectGroup={setSelectedChat}
            onCreateGroup={() => setShowGroupModal(true)}
            onShowMeetings={() => setShowMeetings(true)}
            messageCount={unreadUsersCount}
            groupCount={unreadGroupsCount}
            unreadPerUser={unreadPerUser}
            unreadPerGroup={unreadPerGroup}
          />

          <div className="wc-main">
            {selectedChat ? (
              <>
                <ChatHeader
                  chat={selectedChat}
                  user={selectedChat}
                  onCall={() => handleStartCall('voice')}
                  onVideoCall={() => handleStartCall('video')}
                  onShowMembers={() => setShowMembers(!showMembers)}
                  onSearch={setMsgSearch}
                  onStartVoiceCall={() => handleStartCall('voice')}
                  onStartVideoCall={() => handleStartCall('video')}
                  onOpenCalendar={() => setShowMeetings(true)}
                  onToggleMembers={() => setShowMembers(!showMembers)}
                  search={msgSearch}
                  callState={callState}
                />

<<<<<<< HEAD
                <ChatMessages
                  messages={filteredMessages}
                  loggedInEmail={LOGGED_IN_EMAIL}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onReply={handleReply}
                  onForward={handleForward}
                />
=======
                <ChatMessages messages={filteredMessages} loggedInEmail={LOGGED_IN_EMAIL} />
>>>>>>> 8919f074616fdc41654f6b90fe9b7dec0c5a93c6

               <ChatComposer
  onSend={sendMessage}
  replyMessage={replyMessage}
  setReplyMessage={setReplyMessage}
/>

                {showMembers && selectedChat.type === "GROUP" && (
                  <GroupMembersPanel
                    group={selectedChat}
                    onClose={() => setShowMembers(false)}
                    onGroupUpdated={(updatedGroup) => {
                      // Update the group in the groups list
                      setGroups(prev => prev.map(g =>
                        g.id === updatedGroup.id ? { ...g, ...updatedGroup } : g
                      ));
                      // Update selectedChat if it's the same group
                      if (selectedChat?.id === updatedGroup.id) {
                        setSelectedChat(prev => ({ ...prev, ...updatedGroup }));
                      }
                    }}
                    onGroupLeft={(groupId) => {
                      // Remove from groups list and deselect
                      setGroups(prev => prev.filter(g => g.id !== groupId));
                      setSelectedChat(null);
                      setShowMembers(false);
                    }}
                  />
                )}
              </>
            ) : (
              <div className="wc-empty">
                <p>Select a chat to start messaging</p>
              </div>
            )}
          </div>

      {showGroupModal && (
  <CreateGroupModal
    users={users}                 // ✅ REQUIRED
    token={TOKEN}                 // ✅ REQUIRED
    onCreated={(newGroup) => {    // ✅ MATCH PROP NAME
      setGroups((prev) => [...prev, newGroup]);
      setShowGroupModal(false);
    }}
    onClose={() => setShowGroupModal(false)}
  />
)}

          {showMeetings && (
            <MeetingsContainer
              onClose={() => setShowMeetings(false)}
              onJoinMeeting={(meeting) => {
                setActiveMeeting(meeting);
                setShowMeetings(false); // close calendar when joining
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
