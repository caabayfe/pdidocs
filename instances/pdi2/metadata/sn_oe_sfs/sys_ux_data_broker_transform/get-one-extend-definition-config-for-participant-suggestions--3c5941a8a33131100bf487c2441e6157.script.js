function transform() {
	var oneExtendDefinitionConfigGR = new GlideRecord("sys_one_extend_definition_config");
	// Participant Suggestions Capability
	oneExtendDefinitionConfigGR.addQuery("capability","853f0b7243d4f1106ccb3fc9dbb8f251");
	oneExtendDefinitionConfigGR.addActiveQuery();
	oneExtendDefinitionConfigGR.query();
	return oneExtendDefinitionConfigGR.getRowCount() > 0;
}
