(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    return new sn_decision_table.DecisionInputRepository().getDecisionInputsByDecisionTable(arguments.sys_id, arguments.delta);
})(env);
