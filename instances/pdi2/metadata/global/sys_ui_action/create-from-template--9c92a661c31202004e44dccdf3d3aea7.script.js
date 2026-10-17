function showTemplates() {
	var tableName = g_form.getTableName();
	var dialog = new GlideDialogWindow("show_checklist_template_list");
	dialog.setTitle("Create Checklist from Template");
	dialog.setSize(500, 400);
	dialog.setPreference("record", g_form.getUniqueValue());
	dialog.setPreference("tablename", tableName);
	// force the related list to refresh when successful
	dialog.on('template_success', function(){
		reloadWindow(window);
	});
	dialog.render();
}
