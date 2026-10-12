function onSubmit() {
	if (g_form.isNewRecord())
		return true;
	
	// Have any of config_type, cat_item or tablename changed
	if (g_form.getControl("table").changed) {
			// See if we've got any related cxs_table_field_config records
		    var tabelFieldRelList = GlideList2.getByName("cxs_table_config.cxs_table_field_config.cxs_table_config");
			if (tabelFieldRelList && tabelFieldRelList.totalRows == 0)
				return true;
	
			// Prompt the user to warn them and decide whether to continue or not
			if (!confirm(getMessage("The changes to this Table configuration record mean that the related Search fields are no longer valid and will be removed.\n\nDo you want to continue?")))
				return false;
	}
	return true;
}
