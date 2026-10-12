function upgradeToV4() {
	var tableName = g_form.getValue("table");
	var gDialog = new GlideDialogWindow("dialog_text_index_upgrade_to_v4");
	gDialog.setSize(400, 200);
	gDialog.setPreference("table_name", tableName);
	gDialog.setTitle('Upgrade to V4 Format');
	gDialog.render();
}
