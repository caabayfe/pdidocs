function onLoad() {
	
	if (g_form.isNewRecord()) {
		g_form.setReadOnly('profile', false);
		g_form.setDisplay("recurring", false);
		return;
	}
	
	g_form.setReadOnly('profile', true);
	g_form.setReadOnly('lock_profile_settings', true);
	
	g_form.setReadOnly("clone_frequency", true);
	g_form.setReadOnly("occurrences", true);
	g_form.setReadOnly("recurring", true);
	g_form.setReadOnly("clone_id", true);
	
	g_form.setReadOnly("state", true);
	g_form.setReadOnly("source_instance", true);
	g_form.setReadOnly("target_instance", true);
	g_form.setReadOnly("exclude_large_data", true);
	g_form.setReadOnly("preserve_theme", true);
	g_form.setReadOnly("filter_attachment_data", true);
	g_form.setReadOnly("exclude_all_from_exclusion_list", true);
	g_form.setReadOnly("amount_of_data_copied_from_large_tables", true);
	g_form.setReadOnly("preserve_in_progress_update_sets",true);
	g_form.getElement("amount_of_data_copied_from_large_tables").readOnly = true; //Ensure focus does not reveal Options section
	g_form.setReadOnly("scheduled", true);
	g_form.setReadOnly("cluster_node", true);
	g_form.setReadOnly("email", true);
	
}
