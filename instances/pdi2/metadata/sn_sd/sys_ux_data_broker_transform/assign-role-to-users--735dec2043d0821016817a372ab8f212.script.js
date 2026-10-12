function transform(input) {
	  var rolesUtility = new SDRolesUtility();
    return rolesUtility.assignSDRole(input.selectedUsers, input.role);    
}
