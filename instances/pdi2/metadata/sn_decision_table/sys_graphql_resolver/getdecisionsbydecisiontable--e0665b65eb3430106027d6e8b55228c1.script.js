(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var sysId = arguments.sys_id;
    var firstRow = arguments.first_row;
    var lastRow = arguments.last_row;
    var defaultAnswer = arguments.default_answer;
    var delta = arguments.delta;
    var questionRepository = new sn_decision_table.DecisionQuestionRepository();

    if (delta && delta.trim())
        return questionRepository.getDecisionsIncludingDelta(sysId, delta, firstRow, lastRow, defaultAnswer);

    return questionRepository.getDecisionsByDecisionTable(sysId, firstRow, lastRow, defaultAnswer);
})(env);
