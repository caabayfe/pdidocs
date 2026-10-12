function onBefore(current, previous) {
	var name = current.name.toString();
	var scopeLength = current.sys_scope.scope.toString().length;
	var suffix = name.substring(scopeLength + 1, name.length);
	current.suffix = suffix;
}
