function addSolutions() {
	var title = new GwtMessage().getMessage('Adding solutions to update set');
	
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("hierarchical_progress_viewer", false, "40em", "10.5em");
	dd.setTitle(title);
	dd.setPreference('sysparm_ajax_processor', 'SolutionExporterAjax');
	dd.setPreference('sysparm_ajax_processor_sys_id', g_form.getUniqueValue());
	dd.setPreference('sysparm_renderer_expanded_levels', '0'); //collapsed root node by default
	dd.setPreference('sysparm_renderer_hide_drill_down', true);
	dd.setPreference('focusTrap',true);
	dd.render();
}
