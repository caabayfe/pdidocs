(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var sysId = arguments.sys_id;
    var decisionAnswerElement = arguments.decisionAnswerElement;

    return new sn_decision_table.AnswerElementRepository().updateAnswerElement(sysId, decisionAnswerElement);

})(env);
