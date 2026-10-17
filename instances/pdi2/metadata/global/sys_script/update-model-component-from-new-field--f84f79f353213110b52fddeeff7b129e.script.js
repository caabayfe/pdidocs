(function executeRule(current, previous /* null when async */) {
	// This Business Rule will be removed after few releases
	// It is support to support old model_component field for
	// customers with customizations on it.
	if (current.isValidField('model_component')) {
		current.model_component = current.getValue('model_component_id');
	}
}(current, previous));
