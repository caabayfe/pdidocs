function showExtendedStatisticsModal() {
	var tableName = g_form.getElement("name").value;
	var dd = new GlideModal("extended_statistics_dialog", false, 700);
	dd.setTitle("Create Extended Statistics");
	dd.setPreference("sysparm_table_name", tableName);
	dd.render();
}
