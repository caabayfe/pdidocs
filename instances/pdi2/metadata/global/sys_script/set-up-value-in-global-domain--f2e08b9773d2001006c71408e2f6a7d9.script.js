(function executeRule(current, previous /*null when async*/) {
	
	// create or update ApplicationPropertyValue in the global domain
	GlideApplicationProperty.setValue(current.name, current.default_value, 'global');

})(current, previous);
