(function executeRule(current, previous /*null when async*/) {
	// excluding for updates from survey designer
	var pageName = GlideTransaction.get().getPageName();
	if (pageName.indexOf('angular') != -1) return;
	
    var metricTypeId = current.metric_type.sys_id;
	var dbViewName = 'u_metric_' + metricTypeId  + "_result";
	gs.eventQueue('survey.results_view.updated', current, metricTypeId, dbViewName);

})(current, previous);
