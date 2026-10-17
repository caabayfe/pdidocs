(function refineQuery(current, parent) {
	current.addQuery("remote_update_set.remote_base_update_set", parent.remote_base_update_set.sys_id);
	current.addNotNullQuery("remote_update_set.remote_base_update_set");

})(current, parent);
