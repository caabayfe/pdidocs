(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;
        
    var tableSysId = env.getArguments().id != null ? env.getArguments().id : env.getSource();
    var gr = new GlideRecord('sys_db_object');
    gr.get(tableSysId);

    return gr;
})(env);
