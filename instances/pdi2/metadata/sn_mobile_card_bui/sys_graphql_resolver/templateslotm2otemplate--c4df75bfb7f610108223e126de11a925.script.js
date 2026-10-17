(function process(env) {
	var templateId = env.getSource();
	var gr = new GlideRecordSecure('sys_sg_view_template');
	gr.query('sys_id', templateId);

	return gr;
})(env);
