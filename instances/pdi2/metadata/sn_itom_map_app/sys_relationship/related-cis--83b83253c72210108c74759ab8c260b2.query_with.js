(function refineQuery(current, parent) {
	var res = global.ListCis.getCis(parent.sys_id);
	current.addQuery("cmdbci_sys_id", "IN", res);
})(current, parent);
