(function refineQuery(current, parent) {
	var allCis = saListCisForIndicators(parent.sys_id);
	current.addQuery("ci_item", "IN", allCis);
	current.addQuery("task.active", true);
})(current, parent);
