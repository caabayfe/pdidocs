(function refineQuery(current, parent) {
	current.addQuery("update_source", parent.sys_id);
	current.addNotNullQuery("remote_base_update_set");
	current.addNullQuery("parent");

})(current, parent);
