(function refineQuery(current, parent) {
	current.addQuery('document', parent.sys_id);
	current.addQuery('table', parent.sys_class_name);
})(current, parent);
