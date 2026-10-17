(function executeRule(current, previous /*null when async*/) {
	var path = current.inputs.end_point.toString();

	if(path && path.indexOf('/api') != 0 && path.indexOf('{{') != 0) {
		var errorMessage = gs.getMessage("Invalid value for Path. Path should start with API endpoint, /api. Eg. /api/now/table/incident");
		gs.addErrorMessage(errorMessage);
		current.setAbortAction(true);
	}
})(current, previous);
