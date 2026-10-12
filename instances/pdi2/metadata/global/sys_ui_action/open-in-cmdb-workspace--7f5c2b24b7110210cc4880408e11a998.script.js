function openRecordInCMDBWS() {
	var sys_id = g_form.getUniqueValue();
	var table = g_form.getTableName();

	var url = "/now/cmdb/record/" + table + "/" + sys_id;
	g_navigation.openPopup(url);
}
