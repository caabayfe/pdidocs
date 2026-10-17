(function executeRule(current, previous /*null when async*/) {

	// Integer Bounds are very sensitive and any change in values should reflect on DBQueryExecutor.java.
	var lowerBound = 1024 * 1024; // 1 MB
	var higherBound = 32 * 1024 * 1024; // based on max_packet_size i.e., 32 MB
	
	if (!gs.hasRole('maint')) {
		gs.addErrorMessage(gs.getMessage("Only users with maint role can create|update|delete this property"));
		current.setAbortAction(true);
		return;
	}
	
	if (current.getValue("type") != "integer") {
		gs.addErrorMessage(gs.getMessage("Provided type value: {0} is not Integer", [GlideStringUtil.escapeHTML(current.getValue("type"))]));
		current.setAbortAction(true);
		return;
	}
		
	if (isNaN(current.value) || isNaN(parseInt(current.value))) {
		gs.addErrorMessage(gs.getMessage("Provided threshold value: {0} is not an integer", [GlideStringUtil.escapeHTML(current.value)]));
		current.setAbortAction(true);
		return;
	}
	
	if (parseInt(current.value) > parseInt(higherBound)) {
		gs.addErrorMessage(gs.getMessage("Provided threshold: {0} is above maximum threshold: {1}", [GlideStringUtil.escapeHTML(current.value), GlideStringUtil.escapeHTML(higherBound)]));
		current.setAbortAction(true);
		return;
	} else if (parseInt(current.value) < parseInt(lowerBound)) {
		gs.addErrorMessage(gs.getMessage("Provided threshold: {0} is below the minimum threshold: {1}", [GlideStringUtil.escapeHTML(current.value), lowerBound]));
		current.setAbortAction(true);
		return;
	}
	
})(current, previous);
