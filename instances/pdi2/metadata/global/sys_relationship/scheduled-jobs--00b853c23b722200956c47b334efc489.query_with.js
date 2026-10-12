(function refineQuery(current, parent) {
	current.addQuery('document_key', parent.sys_id);
	current.orderByDesc('finished');
})(current, parent);
