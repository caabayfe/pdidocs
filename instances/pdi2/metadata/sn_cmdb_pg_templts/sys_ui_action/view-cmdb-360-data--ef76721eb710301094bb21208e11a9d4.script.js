function goToMultisourceData() {
	var sys_id = g_form.getUniqueValue();
	var sys_table = g_form.getTableName();

	var url = "$multisource_query_report_data_preview.do#?sys_id=" + sys_id + "&table=" + sys_table ;
	g_navigation.openPopup(url);
}
