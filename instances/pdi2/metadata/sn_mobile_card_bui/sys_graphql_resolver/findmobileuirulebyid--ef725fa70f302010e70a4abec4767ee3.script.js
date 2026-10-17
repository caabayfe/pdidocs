(function process(env) {
	var gr = new GlideRecord('sys_sg_ui_rule');
	gr.addQuery('sys_id', env.getArguments()['id']);
	gr.query();
	
	return gr;
})(env);
