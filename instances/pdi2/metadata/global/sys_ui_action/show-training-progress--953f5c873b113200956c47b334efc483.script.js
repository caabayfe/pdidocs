function popDialog() {
	var gr = new GlideRecord(g_form.getTableName());
	gr.get(g_form.getUniqueValue());
	var sysId = gr.getValue('progress_tracker');
	
	var dd = new GlideDialogWindow("hierarchical_progress_viewer", false, "40em", "10em");
	dd.setTitle("Training Progress");
	dd.setPreference('sysparm_renderer_execution_id', sysId);
	dd.render();
}
