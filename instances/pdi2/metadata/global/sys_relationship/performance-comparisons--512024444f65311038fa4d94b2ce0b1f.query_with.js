(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery("run1", parent.sys_id).addOrCondition("run2", parent.sys_id);

})(current, parent);
