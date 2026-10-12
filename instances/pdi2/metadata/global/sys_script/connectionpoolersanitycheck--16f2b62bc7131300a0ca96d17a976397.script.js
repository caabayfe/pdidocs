(function executeRule(current, previous /*null when async*/) {	
	
	// must be greater than absolute minimum pool size (2)
	if (current.value <= 2) {
		gs.addErrorMessage(gs.getMessage("Initial connection pool size must be greater than two"));
		gs.warn("Did not allow " + current.name + " to be set to " + current.value + " since connection pool size can't be less than or equal to two.");
		current.setAbortAction(true);
		return;
	}
	
	// must be less than absolute maximum (32 or max_transaction_limit)
	var maxLimit = new GlideRecord("sys_properties");
	var hasLimit = maxLimit.get("name", "glide.ui.max_transaction_limit");
	var absoluteMax = hasLimit ? absMax.value : 32;
   
	if (current.value > absoluteMax) {
		gs.addErrorMessage(gs.getMessage("Connection pool size cannot be greater than {0}", absoluteMax));
		gs.warn("Did not allow " + current.name + " to be set to " + current.value + " as it exceeds the maximum allowable value " + absoluteMax);
		current.setAbortAction(true);
		return;
	}
	var success = gs.getMessage("Properties were modified");
	if (!gs.getInfoMessages().contains(success))
		gs.addInfoMessage(success);

})(current, previous);
