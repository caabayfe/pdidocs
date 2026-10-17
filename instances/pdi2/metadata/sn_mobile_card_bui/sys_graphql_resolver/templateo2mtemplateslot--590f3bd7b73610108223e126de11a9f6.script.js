(function process(env) {
	var templateId = env.getSource()['sys_id']['value'];
	var gr = new GlideRecordSecure('sys_sg_view_template_slot');
	gr.query("view_template", templateId);

	return gr;
})(env);
