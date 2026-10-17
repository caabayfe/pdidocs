(function executeRule(current, previous /*null when async*/) {
	// excluding for updates from survey designer
	var pageName = GlideTransaction.get().getPageName();
	if (pageName.indexOf('angular') != -1) return;
	
	var dbViewName = 'u_metric_' + current.sys_id  + "_result";
	gs.eventQueue('survey.results_view.updated', current, current.sys_id, dbViewName);

})(current, previous);
