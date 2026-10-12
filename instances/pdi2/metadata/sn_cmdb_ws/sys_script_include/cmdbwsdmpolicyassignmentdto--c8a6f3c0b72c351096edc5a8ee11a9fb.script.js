var CMDBWsDMPolicyAssignmentDto = Class.create();
CMDBWsDMPolicyAssignmentDto.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class to hold Policy Assignment info required for PolicyDto JSON object.
     * Note: If you add any new property in this class it will show up under PolicyDto object when we send it to UI
     * 
     */
    initialize: function() {},
    //Start: Properties to expose
    task_assignment_type: "",
    task_management_group: "",
    task_management_user: "",
    task_management_field_path: "",
    user_group: "",
    user: "",
	empty_assignment_action: "",
	empty_assignment_value: "",
    //End: Properties to expose

    populate: function(policyGr) {
        this.task_assignment_type = policyGr.getValue(this.POLICY.TASK_ASSIGNMENT_TYPE);
        this.task_management_group = policyGr.getValue(this.POLICY.TASK_MANAGEMENT_GROUP);
        this.task_management_user = policyGr.getValue(this.POLICY.TASK_MANAGEMENT_USER);
        this.user_group = policyGr.getValue(this.POLICY.USER_GROUP);
        this.user = policyGr.getValue(this.POLICY.USER);
        if (policyGr.isValidField(this.POLICY.TASK_MANAGEMENT_FIELD_PATH)) {
            this.task_management_field_path = policyGr.getValue(this.POLICY.TASK_MANAGEMENT_FIELD_PATH);
        }
		if(!this.POLICY.UNASSIGNED_TASK_OPTIONS.CREATE_UNASSIGNED_TASK.equals(policyGr.getValue(this.POLICY.UNASSIGNED_TASK_ACTION))){
			this.empty_assignment_action = this.POLICY.UNASSIGNED_TASK_POLICY_OPTIONS.CREATE_ASSIGNED_TASK;
		} else {
			this.empty_assignment_action = this.POLICY.UNASSIGNED_TASK_POLICY_OPTIONS.CREATE_UNASSIGNED_TASK;
		}
		this.empty_assignment_value = policyGr.getValue(this.POLICY.UNASSIGNED_TASK_ASSIGNEE);
    },

    validate: function(policyGr) {
        var assignmentType = policyGr.getValue(this.POLICY.TASK_ASSIGNMENT_TYPE);
        var user = policyGr.getValue(this.POLICY.USER);
        var userGroup = policyGr.getValue(this.POLICY.USER_GROUP);
        var groupField = policyGr.getValue(this.POLICY.TASK_MANAGEMENT_GROUP);
        var userField = policyGr.getValue(this.POLICY.TASK_MANAGEMENT_USER);
        var fieldPath = '';
        if (policyGr.isValidField(this.POLICY.TASK_MANAGEMENT_FIELD_PATH)) {
            fieldPath = policyGr.getValue(this.POLICY.TASK_MANAGEMENT_FIELD_PATH);
        }
        if (assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_USER) {
            if (gs.nil(user)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy user field should not be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy user field should not be empty", false, null);
            }
            if (!gs.nil(userGroup)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy user group field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy user group field should be empty", false, null);
            }
            if (!gs.nil(groupField)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy task management group field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy task management group field should be empty", false, null);
            }
            if (!gs.nil(userField)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy task management user field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy task management user field should be empty", false, null);
            }
        } else if (assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_GROUP) {
            if (!gs.nil(user)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy user field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy user field should be empty", false, null);
            }
            if (gs.nil(userGroup)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy user group field should not be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy user group field should not be empty", false, null);
            }
            if (!gs.nil(groupField)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy task management group field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy task management group field should be empty", false, null);
            }
            if (!gs.nil(userField)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy task management user field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy task management user field should be empty", false, null);
            }
        } else if (assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD) {
            if (!gs.nil(user)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy user field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy user field should be empty", false, null);
            }
            if (!gs.nil(userGroup)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy user group field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy user group field should be empty", false, null);
            }
            if (gs.nil(groupField) && gs.nil(fieldPath)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy task management group field should not be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy task management group field should not be empty", false, null);
            }
            if (!gs.nil(userField)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy task management user field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy task management user field should be empty", false, null);
            }
        } else if (assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.USER_FIELD) {
            if (!gs.nil(user)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy user field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy user field should be empty", false, null);
            }
            if (!gs.nil(userGroup)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy user group field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy user group field should be empty", false, null);
            }
            if (!gs.nil(groupField)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy task management group field should be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy task management group field should be empty", false, null);
            }
            if (gs.nil(userField) && gs.nil(fieldPath)) {
                throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                    sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy task management user field should not be empty for policyId:{0}!", {
                        0: policyId
                    }),
                    "Policy task management user field should not be empty", false, null);
            }
        } else {
            throw new CMDBWsError("DM_POLICY_ASSIGNMENT_ISSUE",
                sn_i18n.Message.getMessage("sn_cmdb_ws", "Unidentified assignment type for policyId:{0}!", {
                    0: policyId
                }),
                "Unidentified assignment type", false, null);
        }
    },

    type: 'CMDBWsDMPolicyAssignmentDto'
});
