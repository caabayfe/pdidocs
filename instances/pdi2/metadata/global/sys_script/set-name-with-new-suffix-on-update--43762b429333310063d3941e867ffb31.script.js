function onBefore(current, previous) {
	var name = current.name.toString();
	var prevSuffix = previous.suffix.toString();
	if(!previous.suffix.nil() && endsWith(name, prevSuffix)) {
		var prefix = name.substring(0, name.indexOf(prevSuffix));
		current.name = prefix + current.suffix.toString();
	} else if(previous.suffix.nil() && !current.isInGlobalScope()) {
		current.name = current.sys_scope.scope.toString() + '.' + current.suffix.toString();
	}
	
	function endsWith(name, suffix) {
		if(name.length < suffix.length)
			return false;
		return name.indexOf(suffix, name.length - suffix.length) !== -1;
	}
}
