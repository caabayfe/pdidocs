var CMDBWsDMPolicySettingManager = Class.create();
CMDBWsDMPolicySettingManager.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class will have all core business logic to perform on various operation on policy settings.
     */
    initialize: function() {
    },

    /**
     * Add Retirement Custom definition
     * NOTE: Business Rule on the table verifies following things
     *  - Only one definition per cmdb table is allowed.
     *  - The use of 'OR' conditions are not permitted when defining retirement state. Single conditions and conjoined conditions using 'AND' are allowed
     *  - All retirement definitions must be in the form of '<field> is <value>' statements
     * @param {*} tableName : Table name
     * @param {*} queryCondition : Encoded Query
     * @param {*} activeFlag : true/false
     * 
     * @returns sys_id of the newly added retirement custom definition.
     */
    addRetirementCustomDefinition: function(tableName, queryCondition, activeFlag) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_ADD_RETIREMENT_CUSTOM_DEFINITION, this._addRetirementCustomDefinition, tableName, queryCondition, activeFlag);
    },
    _addRetirementCustomDefinition: function(tableName, queryCondition, activeFlag) {
        CMDBWsDMUtil.validateRequiredParam(
            tableName, {
            action: this.ACTIONS.DM_ADD_RETIREMENT_CUSTOM_DEFINITION,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table name is required"),
            details: "Table name is required when adding retirement custom definition",
        });
        CMDBWsDMUtil.validateRequiredParam(
            queryCondition, {
            action: this.ACTIONS.DM_ADD_RETIREMENT_CUSTOM_DEFINITION,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Query condition is required"),
            details: "Query condition is required when adding retirement custom definition",
        });
        return new CMDBWsDMRetirementCustomDefAccessor().addRetirementCustomDefinition(tableName, queryCondition, activeFlag);
    },

    /* Update Retirement Custom definition
     * NOTE: Business Rule on the table verifies following things
     *  - Only one definition per cmdb table is allowed.
     *  - The use of 'OR' conditions are not permitted when defining retirement state. Single conditions and conjoined conditions using 'AND' are allowed
     *  - All retirement definitions must be in the form of '<field> is <value>' statements
     * @param {*} definitionId : SysId for existing Retirement custom definition record
     * @param {*} tableName : Table name
     * @param {*} queryCondition : Encoded Query
     * @param {*} activeFlag : true/false
     * 
     * @returns.
     */
    updateRetirementCustomDefinition: function(definitionId, tableName, queryCondition, activeFlag) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION, this._updateRetirementCustomDefinition, definitionId, tableName, queryCondition, activeFlag);
    },
    _updateRetirementCustomDefinition: function(definitionId, tableName, queryCondition, activeFlag) {
        CMDBWsDMUtil.validateRequiredParam(
            definitionId, {
            action: this.ACTIONS.DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "definitionId is required"),
            details: "definitionId is required when updating retirement custom definition",
        });
        CMDBWsDMUtil.validateRequiredParam(
            tableName, {
            action: this.ACTIONS.DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table name is required"),
            details: "Table name is required when updating retirement custom definition",
        });
        CMDBWsDMUtil.validateRequiredParam(
            queryCondition, {
            action: this.ACTIONS.DM_UPDATE_RETIREMENT_CUSTOM_DEFINITION,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Query condition is required"),
            details: "Query condition is required when updating retirement custom definition",
        });
        return new CMDBWsDMRetirementCustomDefAccessor().updateRetirementCustomDefinition(definitionId, tableName, queryCondition, activeFlag);
    },

    getScheduledJobRunnersList: function(userGroupId, currUserId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_RUN_AS_USERS, this._getScheduledJobRunnersList, userGroupId, currUserId);
    },

    _getScheduledJobRunnersList: function(userGroupId, currUserId) {
        var result = [];
		var addCurrUser = !gs.nil(currUserId);

        var recordId = userGroupId || gs.getProperty(this.SYS_PROPS.RUN_AS_USER_GROUP);
        if (gs.nil(recordId)) {
            gs.error("Bad value returned for sys property fetch: {0}, cannot populate options", this.SYS_PROPS.RUN_AS_USER_GROUP);
        } else {
            var userGroupGr = new GlideRecord(this.SYS_USER_GROUP_MEMBER.TABLE);
            userGroupGr.addQuery(this.SYS_USER_GROUP_MEMBER.GROUP, recordId);
            userGroupGr.query();

            while (userGroupGr.next()) {
				var userId = userGroupGr.getValue(this.SYS_USER_GROUP_MEMBER.USER);
				if(this._userHasRole(userId, this.ROLE.SN_CMDB_ADMIN_ROLE_ID)){
					var element = {};
					element["id"] = userId;
					element["label"] = userGroupGr.user.getDisplayValue();
					result.push(element);
				}
				if(addCurrUser && userId === currUserId) {
					addCurrUser = false;
				}
            }
        }

        if (addCurrUser) {
            var userGr = new GlideRecord(this.SYS_USER.TABLE);
            if (userGr.get(currUserId)) {
                result.push({
                    id: userGr.getUniqueValue(),
                    label: userGr.getDisplayValue()
                });
            }
        }

        result = result.sort(function(a, b) {
            if (a.label > b.label) return 1;
            if (a.label < b.label) return -1;
            return 0;
        });
		result.unshift({
            "id": '',
            "label": gs.getMessage('Select a user...')
        });

        return result;
    },

    getDefaultJobRunner: function() {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_DEFAULT_JOB_RUNNER, this._getDefaultJobRunner);
    },

    _getDefaultJobRunner: function() {
        return gs.getProperty(this.SYS_PROPS.DEFAULT_RUN_AS_USER, '');
    },

	_userHasRole: function(userId, roleId) {
		var gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('user', userId);
		gr.addQuery('role', roleId);
		gr.query();

		return gr.hasNext();
	},

    type: 'CMDBWsDMPolicySettingManager'
});
