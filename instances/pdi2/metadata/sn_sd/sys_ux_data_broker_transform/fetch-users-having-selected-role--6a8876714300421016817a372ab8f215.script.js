function transform(input) {
    var rolesUtility = new SDRolesUtility();
    return rolesUtility.getUsersWithGivenRole(input.role);
}
