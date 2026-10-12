(function executeRule(current, previous /*null when async*/) {

	var currMsg = SNC.UpdateMutex.getCurrentMutexMessage();
		gs.addInfoMessage(gs.getMessage("Update set retrieve is unavailable because another operation '{0}' is running", [currMsg]));

})(current, previous);
