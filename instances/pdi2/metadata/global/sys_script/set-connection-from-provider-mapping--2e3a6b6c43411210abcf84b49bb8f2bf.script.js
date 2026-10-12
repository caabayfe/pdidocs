(function executeRule(current, previous /*null when async*/) {
	// do not update connection if API (subflow) is still the same
	if (current.api == previous.api) {
		return;
	}
	var providerMappingGr = new GlideRecord("sys_generative_ai_provider_mapping");
	if (!providerMappingGr.isValidField("connection")) {
		return;
	}
	providerMappingGr.addQuery("provider_implementation", current.api);
	providerMappingGr.query();
	if (providerMappingGr.next()) {
		current.connection = providerMappingGr.getValue("connection");
	}

})(current, previous);
