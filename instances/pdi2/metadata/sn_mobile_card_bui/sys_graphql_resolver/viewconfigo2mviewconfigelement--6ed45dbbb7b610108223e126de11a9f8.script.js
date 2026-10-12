(function process(env) {

    var viewConfigId = env.getSource()['sys_id']['value'];
	var gr = new GlideRecordSecure('sys_sg_view_config_element');
	gr.query('view_config', viewConfigId);

	return gr;
})(env);
