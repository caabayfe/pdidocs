(function executeRule(current, previous /*null when async*/) {

	var metadata = new GlideRecord('analytics_visualization_metadata');
	metadata.addQuery('visualization', current.sys_id);
	metadata.query();
	metadata.deleteMultiple();

	var stats = new GlideRecord('report_stats');
	stats.addQuery('report_sys_id', current.sys_id);
	stats.query();
	stats.deleteMultiple();

})(current, previous);
