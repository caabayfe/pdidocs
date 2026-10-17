(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('analytics_category_m2m');
	gr.addQuery('type','par_dashboard');
	gr.addQuery('artifact_id',current.sys_id);
	gr.query();
	gr.deleteMultiple();
})(current, previous);
