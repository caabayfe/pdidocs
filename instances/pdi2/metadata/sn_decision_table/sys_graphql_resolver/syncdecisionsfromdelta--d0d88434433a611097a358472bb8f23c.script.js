(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var sysId = arguments.sys_id;
    var deltaSysId = arguments.delta;
    var answerTable = arguments.answerTable;
    var response = new sn_decision_table.DecisionQuestionRepository().syncDecisionsFromDelta(sysId, deltaSysId, answerTable);

    return response.status;
})(env);
