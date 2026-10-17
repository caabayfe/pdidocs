(function executeRule(current, previous /*null when async*/) {
	var schemaId = current.schema;
	var currentResolverSchemaId = current.resolver.schema;
	if (schemaId.toString() !== currentResolverSchemaId.toString()) {
		gs.addErrorMessage("Resolver schema must match current schema");
		current.setAbortAction(true);
	}
})(current, previous);
