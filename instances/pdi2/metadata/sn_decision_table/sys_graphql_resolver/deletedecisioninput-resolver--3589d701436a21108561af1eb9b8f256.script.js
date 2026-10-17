(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var decisionInputSysId = arguments.sys_id;

    return new sn_decision_table.DecisionInputRepository().deleteDecisionInput(decisionInputSysId);

})(env);
