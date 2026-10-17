(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var enableSchemaViewPropertyName = "sn_table_builder.enableSchemaView";
	var enableSchemaView = gs.getProperty(enableSchemaViewPropertyName, true);
	var flags = {};
	flags[enableSchemaViewPropertyName] = enableSchemaView;

	return flags;

})(request, response);
