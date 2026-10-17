var getReportSysID = function (title, table, sys_created_by, sys_created_on, sys_updated_by, sys_updated_on)
{
    var report = new GlideRecord('sys_report');
    report.addQuery('title', '=', title);
    report.addQuery('table', '=', table);
    report.addQuery('sys_created_by', '=', sys_created_by);
    report.addQuery('sys_updated_on', '=', sys_updated_on);
    report.addQuery('sys_updated_by', '=', sys_updated_by);
    report.addQuery('sys_created_on', '=', sys_created_on);
    report.query();
    if(!report.next())
    {
        gs.log("Report not found: " + title + " - " +  table + " - " + sys_created_on + " - " + sys_updated_by);
        return -1;
    }

    return report.sys_id;
};

var reportViewers = function (report)
{
    var reportViews = new GlideRecord('report_stats');
    reportViews.addQuery('report_sys_id', '=', report);
    reportViews.addQuery('sys_updated_on', '>=', gs.monthsAgoStart(6));
    reportViews.addQuery('sys_updated_on', '<', gs.endOfToday());
    reportViews.query();
	if(reportViews.next()){
 if(reportViews.getValue('number_executions_total')==0)
    return -1;
   else
    return reportViews.getValue('number_executions_total');
}
 else return reportViews.getRowCount();

};

reportViewers(getReportSysID(current.title.toString(), current.table.toString(), current.sys_created_by.toString(), current.sys_created_on.toString(), current.sys_updated_by.toString(), current.sys_updated_on.toString()));
