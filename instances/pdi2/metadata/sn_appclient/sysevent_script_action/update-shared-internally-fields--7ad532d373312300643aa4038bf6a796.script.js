var tables = ["sys_store_app", "sys_remote_app"];

tables.forEach(function(table) {
	var existingApps = new GlideRecord(table);
	existingApps.addEncodedQuery("shared_internally=NULL");
	existingApps.setValue("shared_internally", false);
	existingApps.setWorkflow(false);
	existingApps.updateMultiple();
});
