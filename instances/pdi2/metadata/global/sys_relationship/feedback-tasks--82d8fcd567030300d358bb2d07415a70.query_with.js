(function refineQuery(current, parent) {
	
	if(pm.isActive("com.snc.knowledge_advanced.installer")) {
		current.addQuery('feedback.article.article_id',parent.article_id);
	}
	else {
		current.addQuery('feedback.article',parent.sys_id);
	}
	current.addNullQuery("parent");
	var currUser = gs.getUser();
	if(currUser != null && !gs.nil(currUser)) {
		var pref = currUser.getPreference("kb_feedback_task.db.order");
		if(pref == null || gs.nil(pref)) {
			current.orderByDesc("sys_created_on");
		}
	}
	else
		current.orderByDesc("sys_created_on");
	
})(current, parent);
