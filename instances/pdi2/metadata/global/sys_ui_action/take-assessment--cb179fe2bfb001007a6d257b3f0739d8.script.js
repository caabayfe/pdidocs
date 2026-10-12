takeAssessment();

function takeAssessment(){	
	var url = 'assessment_take2.do?sysparm_assessable_sysid=' + current.sys_id.toString() + '&sysparm_assessable_type=' + current.metric_type.toString();
    action.setRedirectURL(url);
}
