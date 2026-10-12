(function process(/*ResolverEnvironment*/ env) {
	var padUtils = new PADUtilsSI();
	if (!padUtils.isPADAuthorizedUser())
		return null;

	var gr = new GlideRecord('sys_hub_flow');
    gr.addQuery('sys_id', env.getSource());
    gr.query();

	return gr;
})(env);
