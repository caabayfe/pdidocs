(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addActiveQuery();
	
	var scope_name = parent.sys_scope.scope + "";
	var extension_name = parent.getValue("name");
	
	if ("global" == scope_name || "" == scope_name)
		current.addQuery("point", "global." + extension_name);
	else
		current.addQuery("point", scope_name + "." + extension_name);

})(current, parent);
