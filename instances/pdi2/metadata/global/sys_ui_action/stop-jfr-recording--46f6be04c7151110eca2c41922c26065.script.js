stopAgentRecording();

function stopAgentRecording() {
	var agentName = current.name.replace(/'/g, "\\'");

	// Update jfr_rec_state to hide this UI Action
	current.jfr_rec_state = "STOPPING";
	current.update();

	// Send system command
	new MIDServerManage().stop_jfr_rec(agentName);

	// reload current form
	action.setRedirectURL(current);
}
