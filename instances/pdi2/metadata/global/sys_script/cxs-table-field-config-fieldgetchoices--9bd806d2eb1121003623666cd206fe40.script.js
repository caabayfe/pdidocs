function cxs_table_field_config_fieldGetChoices() {
	if (!(current && current.getTableName() + "" != ""))
		return;
	cxs_App.getBusiness(current).getFieldChoices();
}
