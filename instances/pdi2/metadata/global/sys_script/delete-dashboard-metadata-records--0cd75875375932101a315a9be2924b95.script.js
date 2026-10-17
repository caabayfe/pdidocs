(function executeRule(current, previous /*null when async*/) {

	var dashboardMetadata = new GlideRecord('analytics_dashboard_metadata');
	dashboardMetadata.addQuery('dashboard', current.sys_id);
	dashboardMetadata.query();
	dashboardMetadata.deleteMultiple();

})(current, previous);
