function transform(input) {
	return { 
		id: input.pluginId, 
		active: GlidePluginManager.isActive(input.pluginId)
	};
}
