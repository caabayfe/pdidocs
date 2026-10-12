(function process( /*ResolverEnvironment*/ env) {
    var role = env.getArguments().role_name;
    var hasRole = gs.hasRole(role);

    return hasRole;
})(env);
