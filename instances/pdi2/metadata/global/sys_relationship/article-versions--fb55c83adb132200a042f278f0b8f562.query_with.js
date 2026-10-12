(function refineQuery(current, parent) {
	if(parent.article_id.nil())
		current.addQuery('sys_id','INVALIDATE_QUERY');
	else {
		current.addQuery('knowledge.article_id',parent.article_id);
		current.orderByDesc('sys_created_on');
	}
	
})(current, parent);
