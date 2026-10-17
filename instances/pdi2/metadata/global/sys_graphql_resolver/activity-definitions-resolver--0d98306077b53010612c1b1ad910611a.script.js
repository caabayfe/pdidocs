(function process(/*ResolverEnvironment*/ env) {
	var gr = new GlideRecordSecure('sys_pd_activity_definition');
	var scope = gs.getCurrentApplicationId();
	var query = 'access=public^NQactive=true^sys_scope='+scope;

	gr.addQuery(query);
    gr.query();

    return gr;
})(env);
