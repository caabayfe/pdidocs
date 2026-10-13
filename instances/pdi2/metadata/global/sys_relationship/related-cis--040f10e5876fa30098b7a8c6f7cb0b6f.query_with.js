(function refineQuery(current, parent) {
	var res = saListCis(parent.sys_id);
	current.addQuery("sys_id", "IN", res);
})(current, parent);
