(function process(env) {
	var templateSlotId = env.getSource()['sys_id']['value'];
	var gr = new GlideRecordSecure('sys_sg_view_config_element');
	gr.query('view_template_slot', templateSlotId);

	return gr;
})(env);
