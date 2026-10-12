function newIndex() {
	var tableName = g_form.getElement("name").value;
	var dd = new GlideModal("index_creator_dialog", false, 700);
	dd.setTitle("Database Indexes");
	dd.setPreference('sysparm_table_name', tableName);
	dd.render();
}
