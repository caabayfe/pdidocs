(function(inputs, outputs) {
	var updateSuccess = false;
    if (current.isValidRecord() && current.canWrite()) {
        current.incident_state = global.IncidentState.IN_PROGRESS;
        current.state = global.IncidentState.IN_PROGRESS;
        var isIncidentReopened = current.update();
        if (isIncidentReopened) {
			updateSuccess = true;
            outputs.messageType = 'info';
            outputs.messageValue = gs.getMessage("Request reopened");
			outputs.liveMessage = gs.getMessage('Reopened Incident');
        }
    }

	if (!updateSuccess) {
		outputs.messageType = 'error';
		outputs.messageValue = gs.getMessage("Unable to reopen request");
	}
})(inputs, outputs);
