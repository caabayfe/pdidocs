(function executeRule(current, previous /*null when async*/) {
	var versioning = new KBVersioning();
	if((current.value+'').toLowerCase()=="true")
		versioning.enable();
	else
		versioning.disable();
})(current, previous);
