(function process(env) {
	var templateId = env.getSource()['sys_id']['value'];
	var gr = new GlideRecordSecure('sys_sg_view_config');
	gr.query('template', templateId);

	return gr;
})(env);
