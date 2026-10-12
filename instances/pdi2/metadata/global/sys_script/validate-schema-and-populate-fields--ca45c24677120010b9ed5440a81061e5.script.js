(function executeRule(current, previous /*null when async*/) {
	try {
		var schemaInfo = sn_graphql.schema.getSchemaInfo(current.schema);
		current.paths = schemaInfo.getPaths();
		current.type_names = schemaInfo.getTypeNames();
	} catch(error) {
		gs.addErrorMessage("Schema:" + error);
		current.setAbortAction(true);
	}
})(current, previous);
