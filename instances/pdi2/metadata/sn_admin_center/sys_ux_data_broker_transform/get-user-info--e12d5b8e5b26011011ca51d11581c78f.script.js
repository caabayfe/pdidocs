function transform(input) {
    return {
        userId: gs.getUserID(),
        userRoles: gs.getUser().getRoles()
    };
}
