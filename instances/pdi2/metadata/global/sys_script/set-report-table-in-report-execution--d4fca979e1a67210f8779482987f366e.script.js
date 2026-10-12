(function executeRule(current, previous) {

	if (!current.report_sys_id)
		return;

	var drillGR = new GlideRecord('sys_report_drill');
	if (drillGR.get(current.report_sys_id)) {
		current.report_table = 'sys_report_drill';
	}

})(current, previous);
