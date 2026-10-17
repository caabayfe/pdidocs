(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var decisionChoice = arguments.decisionChoice;
    return new sn_decision_table.ChoicesRepository().createDecisionChoice(decisionChoice);

})(env);
