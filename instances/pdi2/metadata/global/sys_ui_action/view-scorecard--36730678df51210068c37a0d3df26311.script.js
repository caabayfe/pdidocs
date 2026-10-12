viewAttestScorecard();

function viewAttestScorecard() {
	var sys_id = current.sys_id.toString();
	var table = current.getTableName()
	var display = current.name;
	var title = gs.getMessage("Attestation Scorecard");
	
	var url = 'assessment_scorecard.do?sysparm_record_sysid=' + sys_id + '&sysparm_assessable_table=' + table + '&sysparm_metric_type=' + sys_id + '&sysparm_display=' + encodeURIComponent(display) + '&sysparm_title=' + encodeURIComponent(title) + '&sysparm_uipage=true';
	action.setRedirectURL(url);
}
