(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var decisionChoiceSysId = arguments.sys_id;

    return new sn_decision_table.ChoicesRepository().deleteDecisionChoice(decisionChoiceSysId);

})(env);
