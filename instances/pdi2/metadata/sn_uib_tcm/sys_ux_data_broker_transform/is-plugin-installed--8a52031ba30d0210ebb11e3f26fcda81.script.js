function transform(input) {
    return input.plugins.map(function(plugin) {
        return {
            id: plugin,
            active: GlidePluginManager.isActive(plugin)
        };
    });
}
