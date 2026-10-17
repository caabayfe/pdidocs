//is a specific plugin/scoped app active?
(function(input) {
	if (!input.hasOwnProperty("plugin_id"))
		return false;
	
	return new GlidePluginManager().isActive(input.plugin_id);
})(input);
