function transform(input) {
    var matchedRoles = [];
    if (!input.roleNames) {
        return {
            matchedRoles: matchedRoles
        };
    }
    var roles = (input.roleNames || "").split(",").map(role=>role.trim());
    roles.forEach(role => {
        if (role && gs.hasRole(role)) {
            matchedRoles.push(role);
        }
    });
    return {
        matchedRoles: matchedRoles
    };
}
