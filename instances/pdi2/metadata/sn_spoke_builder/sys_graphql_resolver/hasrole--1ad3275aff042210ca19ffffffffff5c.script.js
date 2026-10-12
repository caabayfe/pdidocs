(function process( /*ResolverEnvironment*/ env) {
    var role = env.getArguments().roleName;
    return gs.hasRole(role);
})(env);
