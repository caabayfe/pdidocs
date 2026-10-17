(function process(env) {
	var viewConfigId = env.getSource()['sys_id']['value'];
	var gr = new GlideRecord('sys_sg_ui_rule');
	gr.query("parent_id", viewConfigId);
	
	return gr;
})(env);
