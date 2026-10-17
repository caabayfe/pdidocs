(function(context, pageParams, blockcontext) {
    var res = NAARoleMaskingUtil.getRoleMaskingRolesForSkill(blockcontext.skillId);
    var roleMaskingDisabled = res.roles.length > 0 && res.roles[0].scope && !res.roles.some(role => role.scope == res.currentApplicationId);
    var roleMaskingDisabledMessage = "";
    if (roleMaskingDisabled) {
        let firstRole = res.roles[0];
        roleMaskingDisabledMessage = sn_i18n.Message.getMessage(
            "sn_nowassist_admin", "To edit the roles please change the application scope to {scope}", {
                scope: firstRole.scope_name ? firstRole.scope_name : firstRole.scope
            }
        );
    }
    var allowAllSessionRoles = res.response.length > 0 ? res.response[0]?.allowAllSessionRoles : undefined;
    return {
        "roleList": res,
        "hide": allowAllSessionRoles ? false : !res?.roles?.length,
        "disableTurnOn": allowAllSessionRoles !== true && res?.roles?.length == 0,
        "roleMaskingDisabledMessage": roleMaskingDisabledMessage,
        "allowAllSessionRoles": allowAllSessionRoles,
        "viewConfigurationTranslatedMessage": sn_i18n.Message.getMessage( "sn_nowassist_admin", "Review configuration")
    };
})(context, pageParams, blockcontext);
