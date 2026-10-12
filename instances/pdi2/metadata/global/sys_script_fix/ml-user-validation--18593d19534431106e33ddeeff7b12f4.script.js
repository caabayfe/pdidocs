validateAndRepair();

function validateAndRepair() {
    var ssworkerUser = "sharedservice.worker";
    var roles = ["platform_ml_read", "platform_ml_write", "platform_ml_create"];
    var userGR = getUserGR(ssworkerUser);
    if (!userGR.next()) { //user does not exist
        userGR = createUser(ssworkerUser);
        assignRolesToUser(userGR, roles);
        return;
    }
    if (!userGR.active) { // Activating user if user is not active
        activateAndUnlockUser(userGR);
    }
    // Identify missing roles
    var missingRoles = activateInactiveRolesAndGetMissingRoles(userGR, roles);
    if (missingRoles.length != 0) { // Adding missing roles if any
        assignRolesToUser(userGR, missingRoles);
    }
}

function getUserGR(userName) {
    var userGR = new GlideRecord("sys_user");
    userGR.addQuery("user_name", userName);
    userGR.query();
    return userGR;
}

function createUser(userName) {
    var userGR = new GlideRecord("sys_user");
    userGR.user_name = userName;
    userGR.first_name = "sharedservice.worker";
    userGR.last_name = "Agent Intelligence Plug-in";
    userGR.active = true;
    userGR.edu_status = "faculty";
    userGR.enable_multifactor_authn = false;
    userGR.internal_integration_user = false;
    userGR.locked_out = false;
    userGR.name = "sharedservice.worker Agent Intelligence Plug-in";
    userGR.password_needs_reset = false;
    userGR.vip = false;
    userGR.web_service_access_only = true;
    if (userGR.insert() == null) {
        gs.info("Unable to create record with user name: {0}", userName);
    }
    return userGR;
}

function activateAndUnlockUser(userGR) {
    userGR.active = true;
	userGR.locked_out = false;
    userGR.update();
    gs.info("sharedservice.worker user has been activated and unlocked.");
}

function activateInactiveRolesAndGetMissingRoles(userGR, roles) {
    var userHasRoleGR = new GlideRecord("sys_user_has_role");
    userHasRoleGR.addQuery("role.name", "IN", roles.toString());
    userHasRoleGR.addQuery("user", userGR.getUniqueValue());
    userHasRoleGR.query();
    var missingRoles = ["platform_ml_read", "platform_ml_write", "platform_ml_create"];
    while (userHasRoleGR.next()) {
        var roleName = userHasRoleGR.role.name.toString();
        if (missingRoles.indexOf(roleName) != -1) {
            var index = missingRoles.indexOf(roleName);
            missingRoles.splice(index, 1);
        }
        if (userHasRoleGR.state != "active") {
            userHasRoleGR.state = "active";
            if (userHasRoleGR.update() == null)
                gs.info("Unable to activate role {0} for the user {1}", userHasRoleGR.role.name, userHasRoleGR.user_name);
        }
    }
    return missingRoles;
}

function assignRolesToUser(userGR, roles) {
    var index = 0;
    while (index < roles.length) {
        var roleName = roles[index++];
        var roleGR = new GlideRecord("sys_user_role");
        roleGR.addQuery("name", roleName);
        roleGR.query();
        if (roleGR.next()) {
            var userHasRoleGR = new GlideRecord("sys_user_has_role");
            userHasRoleGR.user = userGR.getUniqueValue();
            userHasRoleGR.role = roleGR.getUniqueValue();
            userHasRoleGR.state = "active";
            if (userHasRoleGR.insert() == null) {
                gs.info("Unable to add role {0} to the user {1}", roleName, userGr.user_name);
            }
        }
    }
}
