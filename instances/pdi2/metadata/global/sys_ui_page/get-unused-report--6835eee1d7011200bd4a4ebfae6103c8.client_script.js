function ok() {
	
	var rpt = new GlideRecord('sys_report');
	rpt.query();
	while (rpt.next()) {
	   var stats = new GlideRecord('report_stats');
	   stats.addQuery('report_sys_id',rpt.sys_id);
	   stats.query();
	   if (!stats.next()){
			//report doesn't exist on statistics. Create the row with 0
			var stat = new GlideRecord('report_stats');
			stat.initialize();
			stat.report_sys_id = rpt.sys_id;
			stat.insert();
	   }
	}

	GlideDialogWindow.get().destroy();
	return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
