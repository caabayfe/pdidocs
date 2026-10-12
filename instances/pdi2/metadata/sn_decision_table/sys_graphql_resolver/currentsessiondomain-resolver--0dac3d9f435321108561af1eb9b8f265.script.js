(function process( /*ResolverEnvironment*/ env) {

    if (!UserUtil.hasGraphQLAccess())
        return null;

    return UserUtil.getCurrentSessionDomain();

})(env);
