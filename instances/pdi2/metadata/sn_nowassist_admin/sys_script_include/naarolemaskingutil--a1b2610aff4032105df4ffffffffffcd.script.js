var NAARoleMaskingUtil = {
    /**
     * createRoleMaskingRolesForSkill will create role masking roles for skill config
     * 
     * @param {Object} input - The input object contains skillName, skillConfigId and roleList
     * @param {String} input.skillName - The name of the skill config
     * @param {String} input.skillConfigId - The sys_id of the skill config
     * @param {Array} input.roleList - The array of role masking roles corresponding to the skill config
     *
     * @return {Object} response - The response object contains role masking data of the created role masking roles for skill config
     **/
    createRoleMaskingRolesForSkill: function(input) {
        try {
            if (NAARoleUtil.isNAAReadOnlyUser()) {
                return;
            }
            var accessRoleConfigDAO = new global.AgentAccessRoleConfigDAO();
            var payload = {
                "name": input.skillName,
                "agentTable": NAAConstant.SKILL_CONFIG,
                "agent": input.skillConfigId,
                "roleList": input.roleList,
                "action": "limit_to_roles"
            };
            var response = null;
            if (input?.allowAllSessionRoles !== true) {
                response = accessRoleConfigDAO.createAgentRoleConfig(payload);
            }
            return response;

        } catch (error) {
            gs.error("NAARoleMaskingUtil: Error while creating role masking roles for skill config - " + error.toString());
            throw new Error("Error while creating role masking roles for skill config");
        }
    },

    /**
     * getRoleMaskingRolesForSkill will fetch role masking roles for skill config
     * 
     * @param {String} skillConfigId - The sys_id of the skill config
     *
     * @return {Object} response - The response object contains role masking data of the fetched role masking roles for skill config
     **/
    getRoleMaskingRolesForSkill: function(skillConfigId, fallback = {
        getFallbackRecommendations: false,
        parentId: ""
    }) {
        try {
            var accessRoleConfigDAO = new global.AgentAccessRoleConfigDAO();
            var response = accessRoleConfigDAO.getAgentRoleConfigs({
                "agentTable": NAAConstant.SKILL_CONFIG,
                "agent": skillConfigId
            });

            // Get Fallback Recommendations if No Roles exist for Skill
            if (response?.length == 0 && fallback?.getFallbackRecommendations && !gs.nil(fallback?.parentId)) {
                var parent_res = this.getRoleMaskingRolesForSkill(fallback.parentId);
                if (parent_res.response?.length > 0) {
                    this._processFallbackRecommendations(parent_res);
                }
                return parent_res;
            }

            response.forEach(record => {
                var roleListArr = [];
                var roleListObj = record.roleList;
                for (var j = 0; j < roleListObj.size(); j++) {
                    var user = new GlideRecord("sys_user_role");
                    var scope = new GlideRecord(NAAConstant.PLUGIN_TABLE);
                    scope.get(record.scope);
                    user.get(roleListObj.get(j));
                    roleListArr.push({
                        id: user.getDisplayValue("name"),
                        label: user.getDisplayValue("name"),
                        scope_name: scope.getDisplayValue("name"),
                        scope: record.scope,
                        sys_id: roleListObj.get(j),
                        masking_id: record.sysId
                    });
                }
                record.roleList = roleListArr;
            });

            var roles = response?.flatMap(item => item?.roleList) ?? [];
            const mergedRoles = Array.from(
                roles.reduce((map, item) => {
                    if (!map.has(item?.sys_id)) {
                        map.set(item?.sys_id, {
                            id: item?.id,
                            label: item?.label,
                            sys_id: item?.sys_id,
                            masking_id: [item?.masking_id],
                            scope_name: item?.scope_name,
                            scope: item?.scope
                        });
                    } else {
                        const existing = map.get(item?.sys_id);
                        if (!existing?.masking_id.includes(item?.masking_id)) {
                            existing?.masking_id.push(item?.masking_id);
                        }
                    }
                    return map;
                }, new Map()).values()
            );

            return {
                roles: mergedRoles,
                response: response,
                currentApplicationId: gs.getCurrentApplicationId(),
                allowAllSessionRoles: response.length > 0 ? response[0]?.allowAllSessionRoles : undefined,
                isRecommendedRoles: false
            };

        } catch (error) {
            gs.error("NAARoleMaskingUtil: Error while fetching role masking roles for skill config - " + error.toString());
        }
    },


    /**
     * _processFallbackRecommendations will update role masking input response
     * 
     * @param {String} res - The role masking roles output for fallback skill config
     * 
     * Sets isRecommendedRoles Flag to true
     * Removes response array and masking_id from roles array to avoid modifying the parent
     **/
    _processFallbackRecommendations: function(res) {
        res.isRecommendedRoles = true;
        // Remove response array and masking_id from roles array to avoid modifying the parent
        res.response = [];
        if (res.roles && Array.isArray(res.roles)) {
            res.roles.forEach(role => {
                if (role && typeof role === 'object') {
                    delete role.masking_id;
                    delete role.scope;
                    delete role.scope_name;
                }
            });
        }
    },

    /**
     * updateRoleMaskingRolesForSkill will update role masking roles for skill config
     * 
     * @param {Object} input - The input object contains sysId, name and roleList
     * @param {String} input.sysId - The sys_id of the role masking role record for skill config
     * @param {String} input.name - The name of the role masking role record for skill config
     * @param {Array} input.roleList - The array of role masking roles corresponding to the skill config
     *
     * @return {Object} response - The response object contains role masking data of the updated role masking roles for skill config
     **/
    updateRoleMaskingRolesForSkill: function(input) {
        try {
            if (NAARoleUtil.isNAAReadOnlyUser()) {
                return;
            }
            var accessRoleConfigDAO = new global.AgentAccessRoleConfigDAO();
            var response = accessRoleConfigDAO.updateAgentRoleConfig(input.sysId, {
                "roleList": input.roleList
            });
            return response;
        } catch (error) {
            gs.error("NAARoleMaskingUtil: Error while updating role masking roles for skill config - " + error.toString());
            throw new Error("Error while updating role masking roles for skill config");
        }
    },

    /**
     * cloneRoleMaskingRolesOfSkillConfig will clone role masking roles of skill config
     * 
     * @param {String} skillConfigId - The sys_id of the skill config
     * @param {String} newSkillConfigId - The sys_id of the new skill config
     *
     * @return {Object} response - The response object contains role masking data of the cloned role masking roles for new skill config
     **/
    cloneRoleMaskingRolesOfSkillConfig: function(skillConfigId, newSkillConfigId) {
        try {
            if (NAARoleUtil.isNAAReadOnlyUser()) {
                return;
            }
            var result = [];
            var skillName = "";
            var rmResult = NAARoleMaskingUtil.getRoleMaskingRolesForSkill(skillConfigId)?.response;
            var skillConfigGr = new GlideRecord(NAAConstant.SKILL_CONFIG);
            if (skillConfigGr.get(newSkillConfigId)) {
                skillName = skillConfigGr.getDisplayValue("name");
                rmResult?.forEach(record => {
                    result.push(NAARoleMaskingUtil.createRoleMaskingRolesForSkill({
                        skillName: skillName,
                        skillConfigId: newSkillConfigId,
                        roleList: record?.roleList?.map(item => item.sys_id),
                        allowAllSessionRoles: record?.allowAllSessionRoles
                    }));

                });
            }
            return result;

        } catch (error) {
            gs.error("NAARoleMaskingUtil: Error while cloning role masking roles for skill config - " + error.toString());
        }

    },

    /*
     * editRoleMaskingRolesForSkillAPI will edit role masking roles for skill config
     * @param {String} skillConfigId - The sys_id of the skill config
     * @param {String} skillName - The name of the skill config
     * @param {Object} roleMaskingData - The role masking data
     * @return {Object} response - The response object contains role masking data of the edited role masking roles for skill config
     */
    editRoleMaskingRolesForSkillAPI: function(skillConfigId, skillName, roleMaskingData) {
        try {
            var roleList = roleMaskingData.roles.map(role => role.sys_id);
            var result;
            if (roleMaskingData.response.length > 0) {
                result = NAARoleMaskingUtil.updateRoleMaskingRolesForSkill({
                    sysId: roleMaskingData.response[0].sysId,
                    roleList: roleList
                });
            } else {
                result = NAARoleMaskingUtil.createRoleMaskingRolesForSkill({
                    skillName: skillName,
                    skillConfigId: skillConfigId,
                    roleList: roleList
                });
            }
            return {
                body: result,
                status: 200
            };
        } catch (error) {
            gs.error("NAARoleMaskingUtil: Error while editing role masking roles: " + error.toString());
            return {
                status: 400
            };
        }
    },
    type: 'NAARoleMaskingUtil'
};
