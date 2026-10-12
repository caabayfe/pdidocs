(function() {
	if (!current.active) {
		gs.error("CodeSigning RoT transfer: Disable ServiceNow Root of Trust job stops because the job was used once and it cannot be rerun.");
		return false;
	}
	return true;
})();
