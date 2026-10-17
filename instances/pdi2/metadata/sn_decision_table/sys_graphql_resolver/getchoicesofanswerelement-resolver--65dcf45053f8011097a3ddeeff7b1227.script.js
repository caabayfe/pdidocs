(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var src = env.getSource();
    return new sn_decision_table.ChoicesRepository().getChoices(src.name.value, src.element.value);
})(env);
