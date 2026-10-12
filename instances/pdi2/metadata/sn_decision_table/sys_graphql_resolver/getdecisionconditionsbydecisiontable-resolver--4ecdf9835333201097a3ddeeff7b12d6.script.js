(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    return new sn_decision_table.DecisionConditionRepository().getDecisionConditionsByDecisionTable(arguments.sys_id, arguments.delta);
})(env);
