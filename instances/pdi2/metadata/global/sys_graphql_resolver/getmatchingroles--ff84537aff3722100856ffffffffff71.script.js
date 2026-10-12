(function process( /*ResolverEnvironment*/ env) {
    var roles = env.getArguments().roleNames || [];
    var matchingRoles = [];
    for (var i = 0; i < roles.length; i++) {
        var role = roles[i];
        if (role && gs.hasRole(role)) {
            matchingRoles.push(role);
        }
    }
    return matchingRoles;
})(env);
