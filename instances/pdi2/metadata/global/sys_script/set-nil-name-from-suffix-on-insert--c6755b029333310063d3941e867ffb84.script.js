function onBefore(current, previous) {
	current.name = current.sys_scope.scope.toString() + '.' + current.suffix.toString();
}
