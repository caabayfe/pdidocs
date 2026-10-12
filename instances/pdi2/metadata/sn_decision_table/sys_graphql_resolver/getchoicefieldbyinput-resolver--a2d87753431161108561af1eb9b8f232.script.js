(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var src = env.getSource();
    var fieldDetails = DecisionTableUtil.getFieldDetailsByName(src.choice_table.value, src.choice_field.value);

    return fieldDetails;
})(env);
