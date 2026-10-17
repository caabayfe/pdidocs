(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var sysId = arguments.sys_id;
    var decisionInput = arguments.decisionInput;

    return new sn_decision_table.DecisionInputRepository().updateDecisionInput(sysId, decisionInput);

})(env);
