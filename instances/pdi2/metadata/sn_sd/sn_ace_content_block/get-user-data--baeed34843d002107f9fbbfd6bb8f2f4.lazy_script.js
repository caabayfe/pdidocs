(function(context, pageParams, blockcontext) {
    var userData = {};
    var countUserWithSDRead = 0;

    var rolesUtility = new SDRolesUtility();

    var grUserRoles = new GlideAggregate("sys_user_has_role");
    grUserRoles.addAggregate("COUNT(DISTINCT", "user.sys_id");
    grUserRoles.addQuery("role", rolesUtility.getSDRolesList()[2]); // Role = SD_Read
    grUserRoles.setGroup(false);
    grUserRoles.query();
    grUserRoles.next();
    countUserWithSDRead = grUserRoles.getAggregate("COUNT(DISTINCT", "user.sys_id");

    userData.userWithRolesScore = {
        title: gs.getMessage("Users with Success Dashboard roles"),
        score: countUserWithSDRead
    };

    if (countUserWithSDRead == 0) {
        userData.userCardBadge = {
            color: "pink",
            label: gs.getMessage("Configuration needed")
        };
    } else {
        userData.userCardBadge = {
            color: "positive",
            label: gs.getMessage("All set")
        };
    }

    userData.userButton = {
        label: gs.getMessage("Configure"),
        event: "OPR_CONFIGURE_USER_ROLES",
        tooltipContent: gs.getMessage("Review and Configure users with Operational Success roles"),
        configAria: {
            "button": {
                "aria-description": gs.getMessage("Review and Configure users with Operational Success roles"),
                "aria-label": gs.getMessage("Review and Configure users with Operational Success roles")
            }
        }
    };

    return userData;
})(context, pageParams, blockcontext);
