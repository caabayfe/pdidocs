(function executeRule(current, previous /*null when async*/) {
	
	var instanceAPI = new sn_utc.UpgradePlanInstanceTypeAPI();
	if (!instanceAPI.isInstanceLockedAsBuilder())
	  return;
	
	if (current.getValue('value') == 'Consumer' && previous.getValue('value') == 'Builder') {
		gs.addErrorMessage(gs.getMessage("The instance is locked as an upgrade plan builder. You are not allowed to change the instance from builder to consumer once the upgrade plan is built."));
		current.setAbortAction(true);
	}

})(current, previous);
