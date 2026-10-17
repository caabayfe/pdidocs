(function executeRule(current, previous /*null when async*/) {

	var slaAsyncUtils = new SLAAsyncUtils();

	// Async processing is being activated
	if (current.getValue("value") === "true")
		slaAsyncUtils.activateModule();
	// Async processing is being deactivated
	else
		slaAsyncUtils.deactivateModule();

})(current, previous);
