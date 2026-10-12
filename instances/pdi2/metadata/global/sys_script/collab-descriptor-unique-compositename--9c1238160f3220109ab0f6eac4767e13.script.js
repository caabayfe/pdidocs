(function executeRule(current, previous /*null when async*/) {

	var composite_str = "";
	var scope = current.sys_scope.scope; 
	if (scope.nil()) 
		scope = 'global';  
	if (!current.name.nil())   
		composite_str = scope + '.' + current.name;
	current.composite_name = composite_str;

})(current, previous);
