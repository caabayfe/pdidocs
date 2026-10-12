(function executeRule(current, previous /*null when async*/) {
	if (!current.min_version.nil())
		return;

	var depVersion = current.dependency.version;

	if (depVersion.nil())
		current.setValue('min_version', '0.0.1');
	else
		current.setValue('min_version', depVersion);
})(current, previous);
