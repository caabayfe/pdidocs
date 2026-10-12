function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) 
		return;
	
	if(newValue == '') {
		g_form.setValue('target_instance', '');
		g_form.setValue('scheduled', '');
		g_form.setValue('exclude_all_from_exclusion_list', true);
		g_form.setValue('exclude_large_data', true);
		g_form.setValue('filter_attachment_data', true);
		g_form.setValue('preserve_in_progress_update_sets', '');
		g_form.setValue('preserve_theme', true);
		g_form.setValue('amount_of_data_copied_from_large_tables', 'full');
		return;
	}
	
	loadCloneOptionsFromProfile();
}
