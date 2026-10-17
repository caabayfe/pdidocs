(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var decisionAnswerElement = arguments.decisionAnswerElement;
    return new sn_decision_table.AnswerElementRepository().createAnswerElement(decisionAnswerElement);

})(env);
