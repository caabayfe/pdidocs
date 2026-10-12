(function(inputs, outputs) {
	var updateSuccess = false;
    if (current.isValidRecord() && current.canWrite()) {
        current.incident_state = global.IncidentState.RESOLVED;
        current.state = global.IncidentState.RESOLVED;
        current.resolved_by = gs.getUserID();
        updateSuccess = current.update();
    }

	if (!updateSuccess) {
		outputs.messageType = 'error';
		outputs.messageValue = gs.getMessage('Unable to resolve incident');
	} else {
		outputs.liveMessage = gs.getMessage('Resolved Incident');
	}

})(inputs, outputs);
