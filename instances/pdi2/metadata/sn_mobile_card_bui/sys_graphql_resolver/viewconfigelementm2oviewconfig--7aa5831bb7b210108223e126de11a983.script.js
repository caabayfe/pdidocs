(function process(env) {
	var viewConfigId = env.getSource();
    var gr = new GlideRecordSecure('sys_sg_view_config');
    gr.query('sys_id', viewConfigId);

    return gr;
})(env);
