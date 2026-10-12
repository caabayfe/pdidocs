(function refineQuery(current, parent) {
	// Add your code here, such as current.addQuery(field, value);
	var CONSTANTS = new sn_ace.ACEAppBuilderMetaData();
	current.addQuery('document_id', parent.getUniqueValue());
	current.addQuery('document_table', CONSTANTS.TABLES.APP_CONFIG);
	current.addQuery('type', CONSTANTS.CONTENT_BLOCK_TYPES.MODULE);

})(current, parent);
