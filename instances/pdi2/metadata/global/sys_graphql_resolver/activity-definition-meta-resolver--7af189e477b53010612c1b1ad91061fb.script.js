(function process(/*ResolverEnvironment*/ env) {
	var padUtils = new PADUtilsSI();
	if (padUtils.isPADAuthorizedUser()) {
		var gr = new GlideRecord('var_dictionary');
		gr.addQuery('model_id', env.getSource());
		gr.query();

		return gr;
	}
	return [];
})(env);
