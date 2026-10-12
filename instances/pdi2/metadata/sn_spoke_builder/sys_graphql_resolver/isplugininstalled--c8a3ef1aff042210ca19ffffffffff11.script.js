(function process( /*ResolverEnvironment*/ env) {
    var plugin = env.getArguments().pluginName;
    return GlidePluginManager.isActive(plugin);
})(env);
