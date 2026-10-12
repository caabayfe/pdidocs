function onBefore(current, previous) {
    var scriptType = current.type.toString();
	if ('script' != scriptType) {
		current.require_csrf = false;
	}
}
