(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var sysId = arguments.sys_id;
    var decisionChoice = arguments.decisionChoice;

    return new sn_decision_table.ChoicesRepository().updateDecisionChoice(sysId, decisionChoice);

})(env);
