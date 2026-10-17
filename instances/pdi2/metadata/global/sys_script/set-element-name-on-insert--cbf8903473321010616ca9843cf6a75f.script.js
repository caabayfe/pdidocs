(function executeRule(current, previous /*null when async*/) {

	// Setting the element on insert using the Scope and Sys_id, hence would be unique as well
	var scope = current.sys_scope.scope;
    if (scope.nil()) scope = 'global';
	current.element_name = scope + "_" + current.sys_id;

})(current, previous);
