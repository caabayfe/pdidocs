(function process(/*ResolverEnvironment*/ env) {
	var gr = new GlideRecordSecure('sys_sg_view_config');
	gr.addQuery('sys_id', env.getArguments()['id']);
	gr.query();

	return gr;
})(env);
