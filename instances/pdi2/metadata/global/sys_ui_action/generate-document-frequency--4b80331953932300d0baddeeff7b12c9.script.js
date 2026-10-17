function dfCreatorPopup(){
	var tableName = g_form.getValue("table");
	var gDialog = new GlideDialogWindow("dialog_text_index_df_creator");
	gDialog.setSize(400, 250);
	gDialog.setPreference("table_name", tableName);
	gDialog.setTitle('Generate Document Frequency Data');
	gDialog.render();
}
