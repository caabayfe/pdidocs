function transform(input) {
    var rolesUtility = new SDRolesUtility();
    var response = {};
    if (input.module == 'success-dashboard' || input.module == 'operational-success') {
        response.roles = rolesUtility.createDropdownList(rolesUtility.getSDRolesList());
        response.donutData = rolesUtility.getAggregateData(rolesUtility.getSDRolesList());
    }
    if (input.module == 'benchmarks') {
        response.roles = rolesUtility.createDropdownList(rolesUtility.getBMRolesList());
        response.donutData = rolesUtility.getAggregateData(rolesUtility.getBMRolesList());
    }
    if (response.roles) {
        response.selectedRole = response.roles[0].id;
        response.selectedRoleLabel = response.roles[0].label;
    }
    return response;
}
