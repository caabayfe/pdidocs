function onAfter(current, previous) {
    var repId = current.report;
    var grReportScheduled = new GlideRecord('sys_report');
    grReportScheduled.get(repId);
    if (grReportScheduled.isValidRecord()) {
        grReportScheduled.setValue('is_scheduled', true);
        grReportScheduled.update();
    }

    var previousReportId = previous.report;
	if (previousReportId) {
        var grSysAutoReport = new GlideRecord('sysauto_report');
        grSysAutoReport.addQuery('report', previousReportId);
        grSysAutoReport.setLimit(1);
        grSysAutoReport.query();
        if (!grSysAutoReport.next()) {
            grReportScheduled.initialize();
            grReportScheduled.get(previousReportId);
            if (grReportScheduled.isValidRecord()) {
                grReportScheduled.setValue('is_scheduled', false);
                grReportScheduled.update();
            }
        }
    }
}
