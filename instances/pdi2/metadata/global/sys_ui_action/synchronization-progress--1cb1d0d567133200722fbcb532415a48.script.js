var dd = new GlideModal('hierarchical_progress_viewer', true);
dd.on("beforeclose", function() {
	g_navigation.reloadWindow();
});

dd.setTitle("Term Synchronization Progress");
var executionTrackerID = g_form.getValue('execution_tracker');

// Set preferences on progress viewer
dd.setPreference('sysparm_renderer_expanded_levels', '0'); // collapsed root node by default
dd.setPreference('sysparm_renderer_hide_drill_down', true);
dd.setPreference('sysparm_renderer_execution_id', executionTrackerID);
dd.render();
