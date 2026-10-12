function transform(input) {
	return input.pluginIds.split(",").reduce(function(prev, pluginId) {
		prev[pluginId] = {
			id: pluginId,
			active: GlidePluginManager.isActive(pluginId)
		};
		return prev;
	}, {});
}
