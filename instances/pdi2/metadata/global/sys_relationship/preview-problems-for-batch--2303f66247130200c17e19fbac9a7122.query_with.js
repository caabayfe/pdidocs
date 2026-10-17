(function refineQuery(current, parent) {
	current.addQuery("remote_update_set.remote_base_update_set", parent.sys_id);
	current.addNullQuery("status");

})(current, parent);
