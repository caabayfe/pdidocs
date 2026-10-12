function transform(input) {
	var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
	var result = {};
	var sysId = input.sysId;

	if (!sysId)
		return null;

	var grGrpQueryMetadata = new GlideRecord("sn_cmdb_ws_group_query_metadata");
	if (grGrpQueryMetadata.get(sysId)) {
		var grGrpEncodedQuery = new GlideRecord("cmdb_group_contains_encoded_query");
		grGrpEncodedQuery.setCategory(util.CMDB_WORKSPACE_DB_CATEGORY);
		grGrpEncodedQuery.get(grGrpQueryMetadata.getValue("encoded_query"));

		var className = grGrpEncodedQuery.getValue("class");
		var condition = util.isSimpleConditionEnabled() ? grGrpEncodedQuery.getValue("simple_condition") : grGrpEncodedQuery.getValue("condition");

		result.name = grGrpQueryMetadata.getValue("name");
		result.class = { label: gs.getMessage("Class"), name: className };
		result.encodedQuery = condition;
	}

	return result;
}
