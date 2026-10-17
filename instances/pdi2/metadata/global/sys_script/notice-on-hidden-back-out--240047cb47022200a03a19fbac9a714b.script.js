(function executeRule(current, previous /*null when async*/) {
	if (SNC.UpdateMutex.isAvailable())
		gs.addInfoMessage(gs.getMessage("The Update Set Back Out button is not available because the system is currently upgrading. <a href=\"$upgrade_client.do\">Click here</a> for the Upgrade Monitor"));
	else {
		//Notify on the current running mutex operation
		var currMsg = SNC.UpdateMutex.getCurrentMutexMessage();
		gs.addInfoMessage(gs.getMessage("The Update Set Back Out button is unavailable because another operation is running: {0}", [currMsg]));
	}
})(current, previous);
