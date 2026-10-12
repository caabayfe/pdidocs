(function refineQuery(current, parent) {
	
	if(parent.feedback)
		current.addQuery('kft_feedback',parent.feedback.sys_id);
	else if(!parent.feedback)
		current.addQuery('kft_parent',parent.parent.sys_id);
	var currUser = gs.getUser();
	if(currUser != null && !gs.nil(currUser)) {
		var pref = currUser.getPreference("kb_feedback_task_metric.db.order");
		if(pref == null || gs.nil(pref)) {
			current.orderBy("mi_start");
		}
	}
	else
		current.orderBy("kft_start");
	
})(current, parent);
