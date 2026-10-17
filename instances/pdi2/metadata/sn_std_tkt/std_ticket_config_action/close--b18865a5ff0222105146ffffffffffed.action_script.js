(function(inputs, outputs) {
	var updateSuccess = false;
    if (current.isValidRecord() && current.canWrite()) {
        current.incident_state = global.IncidentState.CLOSED;
        current.state = global.IncidentState.CLOSED;
        updateSuccess = current.update();
		outputs.liveMessage = gs.getMessage('Closed Incident');
    }

	if (!updateSuccess) {
		outputs.messageType = 'error';
		outputs.messageValue = gs.getMessage('Unable to close request');
	}
})(inputs, outputs);
