(function process(env) {
    var gr = new GlideRecordSecure('sys_sg_view_config');
    gr.addQuery('sys_scope', env.getArguments()['scope']);
    gr.query();

    return gr;
})(env);
