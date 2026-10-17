(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    var arguments = env.getArguments();
    var decisionInput = arguments.decisionInput;
    return new sn_decision_table.DecisionInputRepository().createDecisionInput(decisionInput);

})(env);
