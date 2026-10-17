function onLoad() {
    if (g_scratchpad.isRootTableConfig) {
		jQuery("#msg_link_parent_config").parent().hide();
        g_form.setDisplay("parent_entity", false);
		if(g_form.getReference("project").is_le_progress == "true") {
			setCustomStartStopVisibility(false);
		}
    } else {
		setCustomStartStopVisibility(false);
	}
	
	function setCustomStartStopVisibility(isVisible) {
		if(!isVisible) {
			g_form.setValue("custom_start_condition", "");
			g_form.setValue("custom_stop_condition", "");
		}
		g_form.setSectionDisplay("advanced_condition", isVisible);
	}
}
