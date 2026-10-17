(function refineQuery(current, parent) {
	
	if(pm.isActive("com.snc.knowledge_advanced.installer")) {
		current.addQuery('article.article_id',parent.article_id);
	}
	else {
		current.addQuery('article',parent.sys_id);
	}
	
})(current, parent);
