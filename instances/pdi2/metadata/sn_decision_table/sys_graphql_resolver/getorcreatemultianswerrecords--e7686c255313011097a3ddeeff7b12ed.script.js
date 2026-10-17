(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var decisionTableSysId = env.getArguments().decisionTableSysId;
    var answerElementValuesDetails = env.getArguments().answerElementValuesDetails;
	
	return new sn_decision_table.AnswerRepository().getOrCreateMultipleAnswerRecords(decisionTableSysId, answerElementValuesDetails);

})(env);
