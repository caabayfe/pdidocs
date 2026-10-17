(function process(/*ResolverEnvironment*/ env) {
	var plugin = env.getArguments().plugin_name;
	return GlidePluginManager.isActive(plugin);
})(env);
