(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var decisionAnswerElementSysId = arguments.sys_id;

    return new sn_decision_table.AnswerElementRepository().deleteAnswerElement(decisionAnswerElementSysId);

})(env);
