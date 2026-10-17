(function process( /*ResolverEnvironment*/ env) {
    var gr = new GlideRecord('sys_ux_theme_property');
    gr.get(env.getSource());

    return gr;
})(env);
