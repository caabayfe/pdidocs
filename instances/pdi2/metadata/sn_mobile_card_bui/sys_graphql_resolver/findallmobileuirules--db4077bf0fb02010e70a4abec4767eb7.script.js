(function process(env) {
	var gr = new GlideRecord('sys_sg_ui_rule');
	if (env.getArguments()['scope']) {
		gr.addQuery('sys_scope', env.getArguments()['scope']);
	}
	gr.query();
	
	return gr;
})(env);
