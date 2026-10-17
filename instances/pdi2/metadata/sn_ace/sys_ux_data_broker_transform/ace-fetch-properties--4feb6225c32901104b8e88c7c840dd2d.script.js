function transform(input) {
    if (!input || !input.properties_id_list) return [];
	var contentBlocks = new ACEAppBuilderUtil().getPropertiesPayload(input.properties_id_list);
	return contentBlocks;
}
