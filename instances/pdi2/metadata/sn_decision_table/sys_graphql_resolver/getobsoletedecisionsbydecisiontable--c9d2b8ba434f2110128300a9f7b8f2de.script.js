(function process(/*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var sysId = arguments.sys_id;
    var questionRepository = new sn_decision_table.DecisionQuestionRepository();

    return questionRepository.getObsoleteDecisionsByDecisionTable(sysId);
})(env);
