(function(context, pageParams, blockcontext) {
    var uxApplicabilities = [];
    var uxApplicabilityScreenGR = new GlideRecord('sys_ux_applicability_m2m_screen');
    uxApplicabilityScreenGR.addQuery('screen', 'ad0e332c470c5210632ef855516d43ed').addOrCondition('screen', 'b034cf7877410110c05d885d9f5a9912');
    uxApplicabilityScreenGR.query();

    while (uxApplicabilityScreenGR.next()) {
        uxApplicabilities.push(uxApplicabilityScreenGR.getValue('applicability'));
    }

    var uxCriteriaInclusionGR = new GlideRecord('sys_ux_criteria_m2m_inclusion');
    uxCriteriaInclusionGR.addQuery('applicability', 'IN', uxApplicabilities);
    uxCriteriaInclusionGR.query();

    var includedUserCriterias = [];
    while (uxCriteriaInclusionGR.next()) {
        includedUserCriterias.push(uxCriteriaInclusionGR.getValue('user_criteria'));
    }

    var uxCriteriaExclusionGR = new GlideRecord('sys_ux_criteria_m2m_exclusion');
    uxCriteriaExclusionGR.addQuery('applicability', 'IN', uxApplicabilities);
    uxCriteriaExclusionGR.query();

    var excludedUserCriterias = [];
    while (uxCriteriaExclusionGR.next()) {
        excludedUserCriterias.push(uxCriteriaExclusionGR.getValue('user_criteria'));
    }

    var userCriteriaGR = new GlideRecord('user_criteria');
    userCriteriaGR.addQuery('sys_id', 'IN', includedUserCriterias);
    userCriteriaGR.query();

    var includedUsers = [];
    var includedGroups = [];
    var userCriteriaUsers = "";
    var userCriteriaGroups = "";
    while (userCriteriaGR.next()) {
        userCriteriaUsers = userCriteriaGR.getValue('user');
        userCriteriaGroups = userCriteriaGR.getValue('group');

        if (userCriteriaUsers) {
            includedUsers = includedUsers.concat(userCriteriaUsers.split(','));
        }

        if (userCriteriaGroups) {
            includedGroups = includedGroups.concat(userCriteriaGroups.split(','));
        }
    }

    userCriteriaGR.initialize();
    userCriteriaGR.addQuery('sys_id', 'IN', excludedUserCriterias);
    userCriteriaGR.query();

    var excludedUsers = [];
    var excludedGroups = [];

    while (userCriteriaGR.next()) {
        userCriteriaUsers = userCriteriaGR.getValue('user');
        userCriteriaGroups = userCriteriaGR.getValue('group');

        if (userCriteriaUsers) {
            excludedUsers = excludedUsers.concat(userCriteriaUsers.split(','));
        }

        if (userCriteriaGroups) {
            excludedGroups = excludedGroups.concat(userCriteriaGroups.split(','));
        }
    }

    var SN_SERVICE_DESK_AGENT_ROLE = "42248b8287bb02100645ddbabbbb3532";
    var userRoleGR = new GlideRecord("sys_user_has_role");
    userRoleGR.addQuery("role", SN_SERVICE_DESK_AGENT_ROLE);
    userRoleGR.addQuery("user", "IN", includedUsers);
    userRoleGR.query();

    while (userRoleGR.next()) {
        excludedUsers.push(userRoleGR.getValue("user"));
    }

    var groupRoleGR = new GlideRecord("sys_group_has_role");
    groupRoleGR.addQuery("role", SN_SERVICE_DESK_AGENT_ROLE);
    groupRoleGR.addQuery("group", "IN", includedGroups);
    groupRoleGR.query();

    while (groupRoleGR.next()) {
        excludedGroups.push(groupRoleGR.getValue("group"));
    }

    // Remove excluded users from included users
    includedUsers = includedUsers.filter(function(user) {
        return !excludedUsers.includes(user);
    });

    // Remove excluded groups from included groups
    includedGroups = includedGroups.filter(function(group) {
        return !excludedGroups.includes(group);
    });

    var SDA_ROLE_IS_SUGGESTED_TAB_VISIBLE_CONFIG_SETTING = "1fd84465ff531210907fffffffffff7d";
    var shouldSuggestedTabBeVisible = includedGroups.length + includedUsers.length != 0;
    var configSettingsGR = new GlideRecord("sn_sow_cfg_stg");
    if (configSettingsGR.get(SDA_ROLE_IS_SUGGESTED_TAB_VISIBLE_CONFIG_SETTING)) {
        var isSuggestedTabVisible = configSettingsGR.getValue("value") == "true";
        if (isSuggestedTabVisible != shouldSuggestedTabBeVisible) {
            configSettingsGR.setValue("value", shouldSuggestedTabBeVisible);
            configSettingsGR.update();
        }
    }
    var suggestedTabCount = includedGroups.length + includedUsers.length;
    var suggestedTabLabel = sn_i18n.Message.getMessage('sn_sow_itsm_admin', "Suggested groups and users ({count})", {
        count: suggestedTabCount.toString()
    });

    var selectedRowCount = suggestedTabCount;
    var addButtonLabel = sn_i18n.Message.getMessage('sn_sow_itsm_admin', "Add ({count})", {
        count: selectedRowCount.toString()
    });

    return {
        suggestedUsers: "sys_id IN " + includedUsers,
        suggestedGroups: "sys_id IN " + includedGroups,
        showSuggestedUsers: includedUsers.length > 0,
        showSuggestedGroups: includedGroups.length > 0,
        suggestedUsersSelected: includedUsers,
        suggestedGroupsSelected: includedGroups,
        suggestedTabLabel: suggestedTabLabel,
        suggestedAddButtonLabel: addButtonLabel
    };

})(context, pageParams, blockcontext);
