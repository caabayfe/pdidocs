(function(context, pageParams, blockcontext) {
    var SN_SERVICE_DESK_AGENT_ROLE = "42248b8287bb02100645ddbabbbb3532";

    for (var i = 0; i < blockcontext.suggestedUsersSelected.length; i++) {
        var userRoleGR = new GlideRecord("sys_user_has_role");
        userRoleGR.initialize();
        userRoleGR.setValue("user", blockcontext.suggestedUsersSelected[i]);
        userRoleGR.setValue("role", SN_SERVICE_DESK_AGENT_ROLE);
        userRoleGR.insert();
    }


    for (i = 0; i < blockcontext.suggestedGroupsSelected.length; i++) {
        var groupRoleGR = new GlideRecord("sys_group_has_role");
        groupRoleGR.initialize();
        groupRoleGR.setValue("group", blockcontext.suggestedGroupsSelected[i]);
        groupRoleGR.setValue("role", SN_SERVICE_DESK_AGENT_ROLE);
        groupRoleGR.insert();
    }

    var SDA_ROLE_IS_SUGGESTED_TAB_VISIBLE_CONFIG_SETTING = "1fd84465ff531210907fffffffffff7d";
    var suggestedUsers = blockcontext.suggestedUsers.replace("sys_id IN ", "");
    suggestedUsers = suggestedUsers != "" ? suggestedUsers.split(",") : [];
    var suggestedGroups = blockcontext.suggestedGroups.replace("sys_id IN ", "");
    suggestedGroups = suggestedGroups != "" ? suggestedGroups.split(",") : [];
    var shouldSuggestedTabBeVisible = blockcontext.suggestedUsersSelected.length + blockcontext.suggestedGroupsSelected.length < suggestedUsers.length + suggestedGroups.length;
    var configSettingsGR = new GlideRecord("sn_sow_cfg_stg");
    if (configSettingsGR.get(SDA_ROLE_IS_SUGGESTED_TAB_VISIBLE_CONFIG_SETTING)) {
        configSettingsGR.setValue("value", shouldSuggestedTabBeVisible);
        configSettingsGR.update();
    }

    return {
        suggestedUsersSelected: [],
        suggestedGroupsSelected: [],
        isSuggestedTabVisible: shouldSuggestedTabBeVisible
    };

})(context, pageParams, blockcontext);
