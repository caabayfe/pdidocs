(function process(/*ResolverEnvironment*/ env) {
	var gr = new GlideRecordSecure('sys_pd_activity_type');
    gr.addQuery('sys_id', env.getSource());
    gr.query();

	return gr;
})(env);
