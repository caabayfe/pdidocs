(function executeRule(current, previous /*null when async*/) {

	var pluginId = "com.glide.domain.msp_extensions.installer";
	var pluginManager = new GlidePluginManager();
	var isEnabled = pluginManager.isActive(pluginId);
	
	g_scratchpad.isDomainSeparationEnabled = isEnabled;
	

})(current, previous);
