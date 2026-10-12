(function refineQuery(current, parent) {
	current.addQuery('source', 'STARTSWITH', 'sys_index_suggestion/' + parent.sys_id);
})(current, parent);
