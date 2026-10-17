(function executeRule(current, previous /*undefined when async or display*/) {

	var report = new GlideRecord('sys_report');
	report.addQuery('sys_id', current.report_drilldown);
	report.query();
	while(report.next()){
		report.deleteRecord();
		gs.print('Report Drilldown ' + current.report_drilldown+ ' is deleted');
	}

})(current, typeof previous != 'undefined' ?  previous : null);
