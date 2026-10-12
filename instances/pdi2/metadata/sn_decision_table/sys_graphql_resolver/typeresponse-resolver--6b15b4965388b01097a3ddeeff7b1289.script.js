(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;
              
    var typeId = env.getSource();
    var gr = new GlideRecord('sys_glide_object');
    gr.get('sys_id', typeId);

    return gr;
})(env);
