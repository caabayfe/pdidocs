if (!pm.isZboot()) {
	// Not zboot:
	// Change the default value of "Enable related search box" to "true"
	// Change the default value of "allow expand/collapse" to "true"
	// Change the default value of "enable source selector" and "enable preview buttons" to "false"
	var sd_rsa = new GlideRecord("sys_dictionary");
	sd_rsa.addQuery("name", "cxs_table_config");
	sd_rsa.addQuery("element", "related_search_active");
	sd_rsa.query();
	if (sd_rsa.next()) {
		sd_rsa.setValue("default_value", true);
		sd_rsa.update();
	}
	
	var sd_aec = new GlideRecord("sys_dictionary");
	sd_aec.addQuery("name", "cxs_ui_config_base");
	sd_aec.addQuery("element", "allow_expand_collapse");
	sd_aec.query();
	if (sd_aec.next()) {
		sd_aec.setValue("default_value", true);
		sd_aec.update();
	}
	
	var sd_ctc = new GlideRecord("sys_dictionary");
	sd_ctc.addQuery("name", "cxs_table_config");
	sd_ctc.addQuery("element", "enable_source_selector");
	sd_ctc.query();
	if (sd_ctc.next()) {
		sd_ctc.setValue("default_value", false);
		sd_ctc.update();
	}
	
	var sd_pba = new GlideRecord("sys_dictionary");
	sd_pba.addQuery("name", "cxs_table_config");
	sd_pba.addQuery("element", "preview_button_active");
	sd_pba.query();
	if (sd_pba.next()) {
		sd_pba.setValue("default_value", false);
		sd_pba.update();
	}
	
	// Unmark "enable source selector" checkbox for existing records because it is a new field.
	// And keep the other as they were
	var tc = new GlideRecord("cxs_table_config");
	tc.addActiveQuery();
	tc.query();
	while (tc.next()) {
		tc.setValue("enable_source_selector", false);
		tc.update();
	}
}
