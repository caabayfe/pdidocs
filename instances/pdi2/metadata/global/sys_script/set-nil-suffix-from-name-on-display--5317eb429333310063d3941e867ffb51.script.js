function onDisplay(current, g_scratchpad) {
	var name = current.name.toString();
	var scope = current.sys_scope.scope.toString();
	var scopeLength = scope.length;
	var nameStartsWithScope = name.indexOf(scope + '.') == 0;

	var suffix = nameStartsWithScope ? name.substring(scopeLength + 1, name.length) : name;

	current.suffix = suffix;
	current.setSystem(true);
	current.setWorkflow(false);
	current.update();
}
