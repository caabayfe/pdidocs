(function executeRule(current, previous /*null when async*/) {
	if (current.default_search == previous.default_search || current.default_search == false)
		return;
	
	cxs_App.getBusiness(current).makeDefault();
})(current, previous);
