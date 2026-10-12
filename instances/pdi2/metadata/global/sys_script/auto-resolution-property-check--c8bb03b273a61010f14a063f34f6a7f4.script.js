(function executeRule(current, previous /*null when async*/) {
	var autoResolutionEnabled = gs.getProperty('com.glide.cs.enable_auto_resolution', 'false') === 'true';
	
	if (autoResolutionEnabled)
		return;

	current.active = previous.active;
	
	if (!autoResolutionEnabled) {		
		var linkText = gs.getMessage("enable the property");
		var link = '<a target="_blank" href="/system_properties_ui.do?sysparm_title=Auto%20Resolution%20Properties&amp;sysparm_category=Auto%20Resolution%20Global">' + linkText + '</a>';

		var message = gs.getMessage("This configuration was deactivated, because Auto-Resolution system property needs to be enabled. To activate this configuration, you must {0}.", link);

		gs.addInfoMessage(message);
	}
	
})(current, previous);
