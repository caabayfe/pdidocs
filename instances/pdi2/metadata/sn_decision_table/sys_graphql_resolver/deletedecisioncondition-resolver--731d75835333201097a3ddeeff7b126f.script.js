(function process(/*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;
              
    return new sn_decision_table.DecisionConditionRepository().deleteDecisionCondition(env.getArguments().sys_id);
})(env);
