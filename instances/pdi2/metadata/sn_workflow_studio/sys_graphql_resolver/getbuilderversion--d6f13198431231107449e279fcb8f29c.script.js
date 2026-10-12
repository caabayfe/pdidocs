(function process( /*ResolverEnvironment*/ env) {
    var pluginName = env.getArguments().builder_name;

    var storeAppPluginGR = new GlideRecord('sys_store_app');
    if (pluginName) {
        storeAppPluginGR.addQuery('scope', pluginName);
        storeAppPluginGR.query();
        if (storeAppPluginGR.next())
            return storeAppPluginGR.getValue('version');
    }
    return '';
})(env);
