answer = createPermission();

function createPermission() {
	var poll = current.poll + '';
	poll = poll.substring(0,32);
	var pollMessageGR = new GlideRecordSecure("live_message");
	pollMessageGR.addQuery('poll', poll);
	pollMessageGR.query();
	return pollMessageGR.hasNext();
}
