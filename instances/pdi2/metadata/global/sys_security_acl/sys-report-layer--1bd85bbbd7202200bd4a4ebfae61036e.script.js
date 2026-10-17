var out = false;
if (current.report != ''){
	var report = new GlideRecord('sys_report');
	if(report.get(current.report))
		out = report.canDelete();
}

out;
