(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;
	
    return new sn_decision_table.ChoicesRepository().getChoices(env.getArguments().table_name, env.getArguments().element_name, env.getArguments().languages);
})(env);
