(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var src = env.getSource();
    var decisionTableSysId = src.decision_table.value;
    var answerSysId = src.answer.value;
    var answerDisplayValue = src.answer.display_value;

    return new sn_decision_table.AnswerElementValueRepository().getAnswerDetails(decisionTableSysId, answerSysId, answerDisplayValue);
})(env);
