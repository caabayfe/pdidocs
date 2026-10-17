(function refineQuery(current, parent) {

	current.addQuery('kb_knowledge_base.enable_socialqa', true);
	current.addQuery('kb_knowledge_base', parent.sys_id);
	current.addActiveQuery();

})(current, parent);
