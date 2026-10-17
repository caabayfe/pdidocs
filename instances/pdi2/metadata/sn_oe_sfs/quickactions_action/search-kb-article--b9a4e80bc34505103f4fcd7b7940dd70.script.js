var message = params[0] + "";
var success = true;
try {
	sn_collab.CollabChatScriptObject.sendMessage(record.sys_id, gs.getUserID(), {payload:message, type: "text"}, [], context + "");
} catch (e) {
	message = ""+e.toString();
	success = false;
}

answer = {
    message: message,
    success: success
};
