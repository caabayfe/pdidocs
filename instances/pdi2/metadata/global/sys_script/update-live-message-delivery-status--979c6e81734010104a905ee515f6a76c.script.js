(function executeRule(current, previous /*null when async*/) {

	var liveMessageGR = current.getElement('live_message').getRefRecord();
	if (liveMessageGR.isValidRecord()) {
		liveMessageGR.setValue('delivery_status', current.getValue('status'));
		liveMessageGR.update();
	}

})(current, previous);
