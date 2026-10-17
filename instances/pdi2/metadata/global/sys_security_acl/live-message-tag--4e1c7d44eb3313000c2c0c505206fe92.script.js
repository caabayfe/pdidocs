answer = checkPermissions();

function checkPermissions() {
	if(gs.getUser().hasRole("live_feed_admin")){
		return true;
	}
	var message = current.getValue("message");
	var messageGR = new GlideRecord("live_message");
	messageGR.get(message);

	return messageGR.getValue("sys_created_by") === gs.getUserName();
}
