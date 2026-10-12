(function process( /*ResolverEnvironment*/ env) {
    if (!UserUtil.hasGraphQLAccess())
        return null;

    var role = env.getArguments().role_name;
    var hasRole = gs.hasRole(role);

    return hasRole;
})(env);
