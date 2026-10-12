viewScorecard();

function viewScorecard() {
	if (current.getTableName() == "asmt_assessable_record") {
		var sys_id = current.source_id.toString();
		var table = current.source_table;
		var display = current.name;
	} else {
		var sys_id = current.sys_id.toString();
		var table = current.getTableName() 
		var display = current.name;
	}
	var gr = new GlideRecord("sys_db_object");
	gr.addQuery("name", table)
	gr.query();
	gr.next();
	var title = gs.getMessage("{0} Scorecard", gr.label);
	if (gr.name == 'asmt_metric_type' && (current.source_id.evaluation_method == 'survey'))
		title = gs.getMessage("Survey Scorecard");
	if (gr.name == 'asmt_metric_type' && (current.source_id.evaluation_method == 'quiz'))
		title = gs.getMessage("Quiz Scorecard");
	if (gr.name == 'asmt_metric_type' && (current.source_id.evaluation_method == 'testplan'))
		title = gs.getMessage("Test Plan Scorecard");
	var url = 'assessment_scorecard.do?sysparm_record_sysid=' + sys_id + '&sysparm_assessable_table=' + table + '&sysparm_metric_type=' + current.metric_type + '&sysparm_display=' + encodeURIComponent(display) + '&sysparm_title=' + encodeURIComponent(title) + '&sysparm_uipage=true';
	action.setRedirectURL(url);
}
