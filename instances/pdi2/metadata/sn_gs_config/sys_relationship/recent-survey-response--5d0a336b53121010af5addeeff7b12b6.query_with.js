(function refineQuery(current, parent) {

	current.addQuery("parent_setup_config", parent.sys_id);
	current.addQuery("active", true);

})(current, parent);
