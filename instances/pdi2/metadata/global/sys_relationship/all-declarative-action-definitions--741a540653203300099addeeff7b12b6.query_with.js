(function refineQuery(current, parent) {

	var workspaceCond = current.addQuery("workspace", parent);
		workspaceCond.addOrCondition("workspace", null);

})(current, parent);
