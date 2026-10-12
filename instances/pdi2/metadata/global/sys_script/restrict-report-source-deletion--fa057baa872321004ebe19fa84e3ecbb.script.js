var reports = new GlideAggregate('sys_report');
reports.addQuery('report_source', current.sys_id);
reports.addAggregate("COUNT");
reports.query();
var answer = 0;
if (reports.next())
	answer = reports.getAggregate("COUNT");
if (answer > 0) {
	gs.addErrorMessage(gs.getMessage("Report source can't be deleted because there are Reports using this Report source"));
	gs.addInfoMessage(gs.getMessage("See 'Reports using this report source' under Related Links section on the Report source form"));
	current.setAbortAction(true);
}
