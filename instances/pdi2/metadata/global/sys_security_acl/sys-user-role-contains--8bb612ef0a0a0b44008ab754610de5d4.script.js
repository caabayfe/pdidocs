var rmAPI = new SNC.RoleManagementAPI();
answer = canAccessRole(current.role.sys_id, current.role.name)
			&& canAccessRole(current.contains.sys_id, current.contains.name);

function canAccessRole(rolesysId, roleName) {
    if (!rmAPI.isAllowedToGrantRole(rolesysId))
        return false;
    else if ((roleName == 'maint' || roleName == "nobody") && !gs.hasRole('maint'))
        return false;
    else
        return true;
}
