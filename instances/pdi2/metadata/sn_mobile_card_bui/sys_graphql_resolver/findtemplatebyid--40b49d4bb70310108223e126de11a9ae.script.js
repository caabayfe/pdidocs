(function process(env) {
	var gr = new GlideRecordSecure('sys_sg_view_template');
	gr.addQuery('sys_id', env.getArguments()['id']);
	gr.query();

	return gr;
})(env);
