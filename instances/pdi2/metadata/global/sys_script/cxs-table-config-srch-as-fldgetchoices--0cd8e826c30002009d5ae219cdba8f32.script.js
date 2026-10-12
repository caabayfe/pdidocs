function cxs_table_config_srch_as_fldGetChoices() {
	if (!(current && current.getTableName() + "" != ""))
		return;
	cxs_App.getBusiness(current).getAsUserFieldChoices();
}
