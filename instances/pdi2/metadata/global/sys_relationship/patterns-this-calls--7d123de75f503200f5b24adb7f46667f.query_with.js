(function refineQuery(current, parent) {
	current.addQuery("called_by", parent.sys_id);

})(current, parent);
