(function refineQuery(current, parent) {

	current.addQuery("update_set", parent.sys_id);
	current.addNullQuery("upgrade_plan_history");

})(current, parent);
