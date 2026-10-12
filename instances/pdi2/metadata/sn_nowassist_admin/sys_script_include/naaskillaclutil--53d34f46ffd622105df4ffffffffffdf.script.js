var NAASkillAclUtil = {

    // Helper function to get columnDefinitions of Skill Change data in presentational list
    _getSkillAclColumnDefinitions: function() {
        var columnsData = [
            ["decisionType", sn_i18n.Message.getMessage("sn_nowassist_admin", "Decision type"), "string"],
            ["roles", sn_i18n.Message.getMessage("sn_nowassist_admin", "Roles"), "custom", "now-pill-list"],
            ["editRoles", sn_i18n.Message.getMessage("sn_nowassist_admin", ""), "custom", "now-button-iconic"],
            ["updatedBy", sn_i18n.Message.getMessage("sn_nowassist_admin", "Updated by"), "string"],
            ["updatedOn", sn_i18n.Message.getMessage("sn_nowassist_admin", "Updated on"), "string"],
        ];

        return NAALlmChangeHistoryUtil._getPresentationalListColumns(columnsData);
    },

    // Helper function to get Edit roles cell details of Skill ACL data in presentational list
    _getEditRolesCell: function(readOnly) {
        return {
            "componentProps": {
                "bare": true,
                "icon": "pencil-outline",
                "configAria": {
                    "aria-label": "edit-roles"
                },
                "disabled": readOnly
            }
        };
    },

    // Helper function to get Role cell details of Skill ACL data in presentational list
    _getRolesCell: function(roles, rolesList) {

        if (roles === "any") {
            return {
                "componentProps": {
                    "pills": [{
                        "pillText": "Any authenticated user",
                        "pillValue": "any",
                    }],
                    "style": {
                        "pointer-events": "none"
                    }
                }
            };
        }

        return {
            "componentProps": {
                "pills": roles.map(item => ({
                    "pillText": item,
                    "pillValue": item

                })),
                "maxPillLimit": roles.length,
                "style": {
                    "pointer-events": "none"
                }
            }
        };
    },

    _isReadOnlyACLPolicy: function(sys_id) {
        var aclRecord = new GlideRecord('sys_security_acl');
        if (aclRecord.get(sys_id)) {
            var policy = aclRecord.getDisplayValue('sys_policy');
            return policy && "READ-ONLY" === policy.toUpperCase();
        }
        return false;
    },

    // Helper function to get row Skill ACL data in presentational list
    _getSkillAclRowData: function(row, rolesList) {

        var aclScopeData = new global.ListAndRecordPagePropsUtil().getPageProps("sys_security_acl", row.id);
        if (aclScopeData.is_scope_not_matched) {
            aclScopeData.crossScopeErrorMessage = gs.getMessage("This record is in {0} application, but {1} is the current application. Change scope to edit this.", ['<strong>' + aclScopeData.record_scope_name + '</strong>', '<strong>' + aclScopeData.user_scope_name + '</strong>']);
        }

        var read_only = gs.hasRole('maint') ? false : NAASkillAclUtil._isReadOnlyACLPolicy(row.id);

        return {
            key: row.id,
            aclScopeData: aclScopeData,
            readOnly: read_only,
            cells: {
                decisionType: {
                    value: row.decisionType === "allow" ? sn_i18n.Message.getMessage("sn_nowassist_admin", "Allow if") : sn_i18n.Message.getMessage("sn_nowassist_admin", "Deny unless"),
                    label: row.decisionType,
                    id: row.decisionType
                },
                roles: row.securityAttribute === "UserIsAuthenticated" ? NAASkillAclUtil._getRolesCell("any", rolesList) : NAASkillAclUtil._getRolesCell(row.roles, rolesList),
                editRoles: NAASkillAclUtil._getEditRolesCell(read_only),
                updatedOn: {
                    value: row.updated,
                    label: row.updated,
                    id: row.updated
                },
                updatedBy: {
                    value: row.updatedBy,
                    label: row.updatedBy,
                    id: row.updatedBy
                }
            }
        };
    },

    /*
     * Converts Skill ACL data into presentational list format
     */
    _getSkillAclDataInPresentationalListFormat: function(result) {
        try {
            var rolesList = NowAdminAssistUtil.getRolesListAPI();
            const rowsData = {
                customCellEmittedActions: ["NOW_BUTTON_ICONIC#CLICKED"],
                rows: result.map(item => NAASkillAclUtil._getSkillAclRowData(item, rolesList))
            };

            var can_write = rowsData.rows.length > 0 ? rowsData.rows.some(row => row.readOnly !== true) : true;

            return {
                columnDefinitions: NAASkillAclUtil._getSkillAclColumnDefinitions(),
                rowPayload: rowsData,
                rolesList: rolesList.body.roles,
                canWrite: can_write,
                aclData: result
            };
        } catch (error) {
            gs.error("Error in NAASkillAclUtil._getSkillAclDataInPresentationalListFormat: " + error.toString());
            return {};
        }
    },

    // Get Skill ACL Data
    getSkillAclData: function(skillConfigId) {
        try {
            // Call API to get result
            var result = NAARoleUtil.getACLsForSkillConfig(skillConfigId);
            result = NAASkillAclUtil._getSkillAclDataInPresentationalListFormat(result);
            if (result && result['aclData'] && result['aclData'].length > 0) {
                var aclData = result['aclData'][0];
                var aclScopeData = new global.ListAndRecordPagePropsUtil().getPageProps("sys_security_acl", aclData['id']);
                if (aclScopeData) {
                    aclScopeData.crossScopeErrorMsg = gs.getMessage("The ACL record is in {0} application, but {1} is the current application. Change scope to sync roles.", ['<strong>' + aclScopeData.record_scope_name + '</strong>', '<strong>' + aclScopeData.user_scope_name + '</strong>']);
                    result.aclScopeData = aclScopeData;
                }
            }
            return result;

        } catch (error) {
            gs.error("Error in NAASkillAclUtil.getSkillAclData: " + error.toString());
        }

    },

    getAllowedRolesForSkillConfig: function(skillConfigId) {
        var result = NAARoleUtil.getACLsForSkillConfig(skillConfigId);
        var roleList = [];
        var completeRoleList = NowAdminAssistUtil.getRolesListAPI().body.roles;
        for (let aclData of result) {
            roleList.push(...aclData.roles);
            if (aclData.securityAttribute === "UserIsAuthenticated") {
                return completeRoleList;
            }
        }
        roleList = [...new Set(roleList)];
        if (roleList.length === 0) {
            return completeRoleList;
        }

        const filteredRoles = roleList.map(roleId => {
            const role = completeRoleList.find(r => r.id === roleId);
            return role ? {
                id: role.id,
                label: role.label,
                sys_id: role.sys_id
            } : null;
        }).filter(Boolean);
        return filteredRoles;
    },
    
    type: 'NAASkillAclUtil'
};
