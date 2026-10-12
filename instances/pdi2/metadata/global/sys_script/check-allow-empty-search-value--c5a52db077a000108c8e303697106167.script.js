(function executeRule(current, previous /*null when async*/) {

	var utils = new cxs_Utils();
	var hasAddlResources = utils.hasAddlResources(current.getValue('cxs_context_config'));
	var flag = current.getValue('allow_empty_search_term');
	
	if (flag === '1' && hasAddlResources === false) {
		current.setAbortAction(true);
		var errMsg = gs.getMessage('"Allow search with empty search text" cannot be set to true when there are no Additional Resource Configurations in the Search Context');
		gs.addErrorMessage(errMsg);
	}

})(current, previous);
