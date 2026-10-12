(function process(/*ResolverEnvironment*/ env) {
	var gr = new GlideRecordSecure('sys_pd_activity_type');
	var scope = gs.getCurrentApplicationId();
	var query = 'sys_scope=global^ORsys_scope='+scope;
	
	gr.addQuery(query);
    gr.query();

    return gr;
})(env);
