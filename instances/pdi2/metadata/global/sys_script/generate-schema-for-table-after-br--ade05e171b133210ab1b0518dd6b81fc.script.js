(function executeRule(current, previous /*null when async*/) {
	var schemaApi = new sn_sc_schema.SchemaAPI();
	schemaApi.generateSchemaIfRequired(current.table_name, "avro");
})(current, previous);
