(function executeRule(current, previous /*null when async*/) {

	// if the operation is update and hook is not changed, it's a valid operation.
	if(current.operation() == "update" && current.getValue("hook") == previous.getValue("hook")) {
		return;
	}


	var mappingGr = new GlideRecord("sys_cs_one_api_service_plan_mapping");
	mappingGr.addActiveQuery();
	mappingGr.addQuery("hook", current.getValue("hook"));

	mappingGr.query();
	mappingGr.next();

	// if an active record exists with the given hook, it's an invalid operation.
	if (mappingGr.isValidRecord()) {
		var msg = gs.getMessage("There can be at most one active service plan mapping for any hook (except Scriptable).");
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}
	

})(current, previous);
