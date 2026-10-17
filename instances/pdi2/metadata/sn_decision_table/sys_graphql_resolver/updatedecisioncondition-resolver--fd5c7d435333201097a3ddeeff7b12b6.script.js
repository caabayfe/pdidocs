(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;
              
	var arguments = env.getArguments();
	var sys_id = arguments.sys_id;
	var decisionCondition = arguments.decisionCondition;
    return new sn_decision_table.DecisionConditionRepository().updateDecisionCondition(sys_id, decisionCondition);
})(env);
