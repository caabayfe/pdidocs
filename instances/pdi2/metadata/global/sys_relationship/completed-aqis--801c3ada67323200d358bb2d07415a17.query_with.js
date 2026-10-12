(function refineQuery(current, parent) {
	
	if(new KBAQI().canViewAqiFields(parent)){
		current.addQuery('article.article_id',parent.article_id);
		current.addQuery('state',"submitted");
		var currUser = gs.getUser();
		if(currUser != null && !gs.nil(currUser)) {
			var pref = currUser.getPreference("kb_article_checklist_summary.db.order");
			if(pref == null || gs.nil(pref)) {
				current.orderByDesc("sys_updated_on");
			}
		}
		else
			current.orderByDesc("sys_updated_on");
	}
	else {
		current.addQuery('article',"-1");
	}

})(current, parent);
