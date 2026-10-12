answer = readPermission()

function readPermission() {
	var messageGR = new GlideRecordSecure("live_message");
	return messageGR.get(current.getValue("message"));
}
