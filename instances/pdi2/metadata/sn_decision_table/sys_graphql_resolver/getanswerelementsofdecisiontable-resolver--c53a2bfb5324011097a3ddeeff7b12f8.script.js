(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var decisionTableSysId = arguments.sys_id;
    var delta = arguments.delta;

    return new sn_decision_table.AnswerElementRepository().getAnswerElementsOfDecisionTable(decisionTableSysId, delta);
})(env);
