(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var src = env.getSource();
    var choiceTableDetails = DecisionTableUtil.getTableDetailsByName(src.choice_table.value);
    return choiceTableDetails;
})(env);
