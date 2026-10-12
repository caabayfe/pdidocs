var idle_reminder_timeout = gs.getProperty("com.glide.cs.idle_chat_reminder_timeout",180); // 3 min
var idle_cancel_timeout = gs.getProperty("com.glide.cs.idle_chat_cancel_timeout",360); // 6 min

/** start_timer_on_agent_message - Start idle timer only after Agent has sent a message.
Note : Connect Support Queues do not have Initial Agent Response as a mandatory field. In a scenario where the Initial Agent Response is empty in "Connect Support", the beginning of the conversation will require two messages from Agent to trigger the timeout when below property is set to true.
*/

var start_timer_on_agent_message = gs.getProperty("com.glide.cs.start_idle_timeout_after_agent_response", false); 
new global.IdleChatHandler().process(idle_reminder_timeout,idle_cancel_timeout, start_timer_on_agent_message);
