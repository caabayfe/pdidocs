(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var decisionTableSysId = env.getArguments().decisionTableSysId;
    var answerElementValues = env.getArguments().answerElementValues;
    var label = env.getArguments().label;
	
	return new sn_decision_table.AnswerRepository().getOrCreateMultipleAnswerRecord(decisionTableSysId, answerElementValues, label);
})(env);
