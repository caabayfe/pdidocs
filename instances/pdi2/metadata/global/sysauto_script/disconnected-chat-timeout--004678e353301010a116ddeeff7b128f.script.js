//Periodically checks for "disconnected" chat sessions and ends the conversation if they
//have been disconnected for the specified period of time
var disconnect_timeout = gs.getProperty("com.glide.cs.chat_disconnect_timeout",60); // 60s
new global.IdleChatHandler().processDisconnectedSessions(disconnect_timeout);
