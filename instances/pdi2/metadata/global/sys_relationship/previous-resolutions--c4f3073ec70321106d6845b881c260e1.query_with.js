(function refineQuery(current, parent) {
	current.addQuery("disposition", "4");
	current.addQuery("changed", "true");
	current.addQuery("file_name", parent.getValue('file_name'));
	current.addQuery("sys_created_on", "<", parent.sys_created_on);
	current.orderByDesc("sys_created_on");

})(current, parent);
