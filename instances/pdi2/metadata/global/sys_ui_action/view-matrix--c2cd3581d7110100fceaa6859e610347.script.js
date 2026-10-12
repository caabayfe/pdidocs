viewMatrix();

function viewMatrix(){
	var url = 'assessment_decision_matrix.do?sysparm_matrix_sysid=' + current.sys_id.toString() + '&sysparm_metric_type=' + current.metric_type + '&sysparm_ui_page=assessment_scorecard';
    action.setRedirectURL(url);
}
