function onLoad() {

	// The execution tracker sys_id should come down with the form in g_scratchpad (if there is one)
	var trackerID = g_scratchpad.executionTrackerID;
	if (!trackerID)
		return;

	var modal = new GlideModal("hierarchical_progress_viewer");
	modal.setTitle(new GwtMessage().getMessage("Generating performance comparison"));
	modal.setPreference("sysparm_renderer_execution_id", trackerID);

	// When the tracker is complete, automatically close it and refresh the related list to show performance stats
	modal.on("executionComplete", function() {
		modal.destroy();

		if (GlideLists2 && GlideLists2["sys_atf_performance_compare.sys_atf_performance_stat.comparison"])
			GlideLists2["sys_atf_performance_compare.sys_atf_performance_stat.comparison"].refresh();
	});

	modal.render();

}
