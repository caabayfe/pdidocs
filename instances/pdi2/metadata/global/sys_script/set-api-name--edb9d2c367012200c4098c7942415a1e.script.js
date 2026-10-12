(function executeRule(current, previous /*null when async*/) {

	var scope = current.sys_scope.scope + ".";
	var name = current.script_name + "";
	current.name = scope + name;

})(current, previous);
