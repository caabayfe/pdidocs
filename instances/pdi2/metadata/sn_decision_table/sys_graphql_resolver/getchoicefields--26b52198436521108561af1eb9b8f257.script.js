(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    return DecisionTableUtil.getChoiceTypeFieldsForTable(env.getArguments().choice_table, env.getArguments().choice_filter);

})(env);
