(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var response = new sn_decision_table.DecisionQuestionRepository().deleteObsoleteDecisions(arguments.sys_id);

    return response.status;
})(env);
