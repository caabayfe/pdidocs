if(!GlidePluginManager.isZboot()) {
	gs.info("Started executing fix script to add include_document_tables attribute to table_name field on Security Data Filter table");
	SNC.DictionaryAttribute.set("sys_security_data_filter", "table_name", "include_document_tables", "true");
	gs.info("Finished adding include_document_tables attribute to table_name field on Security Data Filter table");
} else {
	gs.info("Skipped executing fix script on Zboot to add include_document_tables attribute to table_name field on Security Data Filter table");
}
