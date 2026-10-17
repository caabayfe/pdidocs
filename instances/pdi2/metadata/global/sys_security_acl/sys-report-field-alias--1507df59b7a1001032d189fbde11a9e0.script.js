var answer = false;
(function () {
	if (gs.nil(current.report)) {
		answer = true;
	} else {
		var report = new GlideRecord('sys_report');
		if (report.isValid()) {
			report.setWorkflow(false);
			if (report.get(current.report))
				answer = report.canWrite();
		}
	}
}());
