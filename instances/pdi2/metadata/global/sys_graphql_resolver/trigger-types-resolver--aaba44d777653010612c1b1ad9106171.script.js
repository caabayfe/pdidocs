(function process( /*ResolverEnvironment*/ env) {
    var gr = new GlideRecordSecure('sys_pd_trigger_type');
    gr.addQuery('sys_scope', 'global');
    gr.addQuery('active', true);
    if (gs.getProperty('com.glide.pad.core.model.enableMultiTrigger')=='false') {
        gr.addSystemEncodedQuery('sys_id!=d249fae6ff3f12108f25ffffffffff89'); // hardcoded backend/system condition not leveraging user inputs
    }
    gr.query();

    return gr;
})(env);
