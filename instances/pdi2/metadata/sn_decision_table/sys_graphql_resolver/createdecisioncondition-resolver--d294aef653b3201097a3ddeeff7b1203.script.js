(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;
        
    return new sn_decision_table.DecisionConditionRepository().createDecisionCondition(env.getArguments().decisionCondition);
})(env);
