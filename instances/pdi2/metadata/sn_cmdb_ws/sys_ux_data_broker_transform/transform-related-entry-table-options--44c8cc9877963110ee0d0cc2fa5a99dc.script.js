function transform(input) {
	var util = new CMDBWorkspaceUtil();
	if (gs.nil(input) || gs.nil(input.items)) {
		return [];
	}

	return util.transformRelatedEntryTables(input.items);
}
