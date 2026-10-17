(function executeRule(current, previous /*null when async*/) {
	var uri = gs.action.getGlideURI();

	if(uri && uri.toString().includes('data_classification_list'))
		gs.addInfoMessage(gs.getMessage("These classifications are intended as a starting point. Please review carefully to ensure these classifications align with your company’s policies and abide by applicable laws."));
})(current, previous);
