var CMDBWsDMPolicyManager = Class.create();
CMDBWsDMPolicyManager.prototype = Object.extendsObject(CMDBWsDMConstants, {
    /**
     * This class will have all core business logic to perform on various operation on policy.
     */
    initialize: function() {
        this._policyAccessor = new CMDBWsDMPolicyAccessor();
        this._policyJobAccessor = new CMDBWsDMPolicyScheduleJobAccessor();
        this.SUPPORTS_DOT_WALK_ASSIGNMENT = new CMDBWorkspaceUtil().isValidField(this.POLICY.TABLE, this.POLICY.TASK_MANAGEMENT_FIELD_PATH);
    },

    /**
     * Get Policy information.
     * @param {*} policyId 
     * @returns: Policy Dto with policy details.
     * {
     *  "general_info": {},
     *  "data_filter" : {},
     *  "assignment"  : {},
     *  "options"     : {},
     *  "schedule"    : {}    
     * }
     */
    getPolicyInfo: function(policyId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_POLICY, this._getPolicyInfo, policyId);
    },

    _getPolicyInfo: function(policyId) {
        CMDBWsDMUtil.validateRequiredParam(policyId, {
            action: this.ACTIONS.DM_GET_POLICY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
            details: "Policy ID is required when fetching policy information",
        });
        var policyDto = new CMDBWsDMPolicyDto(policyId);
        policyDto.populate();
        return policyDto;
    },

    getPolicyReviewInfo: function(policyId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_POLICY_REVIEW, this._getPolicyReviewInfo, policyId);
    },

    _getPolicyReviewInfo: function(policyId) {
        CMDBWsDMUtil.validateRequiredParam(policyId, {
            action: this.ACTIONS.DM_GET_POLICY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
            details: "Policy ID is required when fetching policy review information",
        });
        var policyGr = this._policyAccessor.getPolicyById(policyId, true);
        var reviewInfo = new CMDBWsDMPolicyReviewInfoDto();
        reviewInfo.populate(policyGr);
        return reviewInfo;
    },

    getPolicyExecutionInfo: function(policyExecutionId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_POLICY_EXECUTION, this._getPolicyExecutionInfo, policyExecutionId);
    },

    _getPolicyExecutionInfo: function(policyExecutionId) {
        CMDBWsDMUtil.validateRequiredParam(policyExecutionId, {
            action: this.ACTIONS.DM_GET_POLICY_EXECUTION,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy execution id is required"),
            details: "Policy execution id is required",
        });
        var peGr = new GlideRecord(this.POLICY_EXECUTION.TABLE);
        if (peGr.get(policyExecutionId)) {
            var number = peGr.getValue(this.POLICY_EXECUTION.NUMBER);
            var policy = peGr.getValue(this.POLICY_EXECUTION.POLICY);
            var taskToCiTable = peGr[this.POLICY_EXECUTION.POLICY].getRefRecord()[this.POLICY.TYPE].getRefRecord()[this.POLICY_TYPE.TASK_TO_CI_TABLE].getRefRecord().getValue(this.NAME);
            return {
                policyExecutionData: {
                    number: number,
                    policy: policy,
                    taskToCI: {
                        table: taskToCiTable,
                        filter: this.TASK_TO_CI.TASK + "." + this.TASK.POLICY_EXECUTION_ID + "=" + policyExecutionId
                    }
                }
            };
        } else {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                source: this.DM_ERROR_SOURCE,
                action: this.ACTIONS.DM_GET_POLICY_EXECUTION,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Unable to find the data manager policy execution record"),
                details: sn_i18n.Message.getMessage("sn_cmdb_ws", "Selected data manager policy execution record ({0}) does not exist", {
                    0: policyExecutionId || "UNKNOWN"
                }),
                logError: true
            });
        }
    },

    /**
     * Create Draft Policy. This function will create draft policy by simply passing general information of the policy.
     * Note: encoded_query value for the Policy is mandatory column in policy table hence we need to set the dummy value for it.
     * @param {*} name 
     * @param {*} description 
     * @param {*} policyType 
     * @param {*} workNotes
     */
    createDraftPolicy: function(name, description, policyType, workNotes) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CREATE_POLICY, this._createDraftPolicy, name, description, policyType, workNotes);
    },

    _createDraftPolicy: function(name, description, policyType, workNotes) {
        CMDBWsDMUtil.validateRequiredParam(name, {
            action: this.ACTIONS.DM_CREATE_POLICY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy name is required"),
            details: "Policy name is required to create draft policy",
        });
        CMDBWsDMUtil.validateRequiredParam(policyType, {
            action: this.ACTIONS.DM_CREATE_POLICY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy type is required"),
            details: "Policy type is required to create draft policy",
        });

        var policyGr;
        if (policyType != this.OOB_POLICY_TYPES.CERTIFICATION.sys_id)
            policyGr = new GlideRecordSecure(this.POLICY.TABLE);
        else
            policyGr = new GlideRecordSecure(this.CERTIFICATION_POLICY.TABLE);
        policyGr.initialize();
        policyGr.setValue(this.POLICY.NAME, name);
        policyGr.setValue(this.POLICY.DESCRIPTION, description);
        policyGr.setValue(this.POLICY.TYPE, policyType);
        if (!gs.nil(workNotes)) {
            // setValue is not supported for journal fields
            policyGr[this.POLICY.WORK_NOTES] = workNotes;
        }
        if (policyType === this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id) {
            policyGr.setValue(this.POLICY.TABLE_COL, this.DEFAULT_RELATED_ENTRY_TABLE);
        } else {
            policyGr.setValue(this.POLICY.TABLE_COL, this.DEFAULT_POLICY_TABLE);
        }

        try {
            policyGr.insert();
        } catch (ex) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_INSERT,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy insert failed"),
                action: this.ACTIONS.DM_CREATE_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "Server side unexpected error occurred when inserting policy. See syslog for more details.",
                logError: true,
                originalError: ex
            });
        }

        var policyId = policyGr.getUniqueValue();
        this._createPolicyRuntimeAttribute(policyId);
        return policyId;
    },

    _createPolicyRuntimeAttribute: function(policyId) {
        var initialUser = this._getDefaultUserOrCurrent();

        var policyRuntimeAttrGr = new GlideRecordSecure(this.RUNTIME_ATTRIBUTE.TABLE);
        policyRuntimeAttrGr.initialize();
        policyRuntimeAttrGr.setValue(this.RUNTIME_ATTRIBUTE.POLICY, policyId);
        policyRuntimeAttrGr.setValue(this.RUNTIME_ATTRIBUTE.STATUS, this.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.DRAFT);
        policyRuntimeAttrGr.setValue(this.RUNTIME_ATTRIBUTE.OPEN_TASK_COUNT, 0);
        policyRuntimeAttrGr.setValue(this.RUNTIME_ATTRIBUTE.RUN_AS, initialUser);

        try {
            var sysId = policyRuntimeAttrGr.insert();
            if (gs.nil(sysId)) {
                var lastError = policyRuntimeAttrGr.getLastErrorMessage();
                throw new Error(lastError);
            }
        } catch (ex) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_FAILED_INSERT,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy runtime attribute insert failed. Please delete this policy and create a new one"),
                action: this.ACTIONS.DM_CREATE_RUNTIME_ATTRIBUTE,
                source: this.DM_ERROR_SOURCE,
                details: "Server side unexpected error occurred when inserting runtime attribute. See syslog for more details",
                logError: true,
                originalError: ex
            });
        }
    },

	_getDefaultUserOrCurrent: function() {
		var currentUser = gs.getUserID();

		var defaultUserProp = gs.getProperty(this.SYS_PROPS.DEFAULT_RUN_AS_USER);
		if(gs.nil(defaultUserProp)){
			return currentUser;
		}

		var defaultUserGr = new GlideRecord(this.SYS_USER.TABLE);
		if(defaultUserGr.get(defaultUserProp)){
			return defaultUserGr.getUniqueValue();
		} else {
			return currentUser;
		}
	},

    /**
     * Update Policy information based on the Update Payload.
     * Note: as per the UI requirement(step flow) update payload will have one policy section to update at a time.
     * In future we can make this method more generic to update multiple section if required.  
     * @param {*} policyId 
     * @param {*} policyPayload : {
     *                              "general_info": {},
     *                              "data_filter" : {},
     *                              "assignment"  : {},
     *                              "options"     : {},
     *                              "schedule"    : {}    
     *                             }
     */
    updatePolicy: function(policyId, policyPayload) {
        CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_UPDATE_POLICY, this._updatePolicy, policyId, policyPayload);
    },

    _updatePolicy: function(policyId, policyPayload) {
        CMDBWsDMUtil.validateRequiredParam(policyId, {
            action: this.ACTIONS.DM_UPDATE_POLICY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
            details: "Policy ID is required when updating policy",
        });
        CMDBWsDMUtil.validateRequiredParam(policyPayload, {
            action: this.ACTIONS.DM_UPDATE_POLICY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy payload is required"),
            details: "Policy payload is required when updating policy",
        });
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_WRITE_ACL,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user does not have permission to update policy"),
                action: this.ACTIONS.DM_UPDATE_POLICY,
                source: this.DM_ERROR_SOURCE,
                details: "No permission to update policy. Data manager admin role required"
            });
        }
        var policyGr = this._policyAccessor.getPolicyById(policyId, true);
        var policyType = '';
        var name = '';
        var description = '';
        var workNotes = '';
        var table = '';
        var taskDueInDays = '';
        var subflow = '';
        var needsReview = '';
        var archiveForDays = '';
        var displayFields = '';
        var certificationFields = '';
        var allowEmptyFields = true;
        var allowFieldUpdates = true;
        var instruction = '';
        var encodedQuery = '';
        var assignmentType = '';
        var specificGroup = '';
        var groupField = '';
        var specificUser = '';
        var fieldPath = '';
		var emptyAssignmentAction = '';
		var emptyAssignmentValue = '';
        var runType = '';
        var runTime = '';
        var runStart = '';
        var runPeriod = '';
        var runDayOfWeek = '';
        var runDayOfMonth = '';
		var runUser = '';

        if (!gs.nil(policyPayload.general_info)) {
            policyType = policyPayload.general_info.cmdb_policy_type;
            name = policyPayload.general_info.policy_name;
            description = policyPayload.general_info.description || '';
            workNotes = policyPayload.general_info.work_notes;
            this._updatePolicyGeneralInfo(policyId, name, description, policyType, workNotes);
        }
        if (!gs.nil(policyPayload.options)) {
            if (gs.nil(policyType)) {
                policyType = policyGr.getValue(this.POLICY.TYPE);
            }
            taskDueInDays = policyPayload.options.task_due_in_days;
            subflow = policyPayload.options.subflow;
            needsReview = policyPayload.options.needs_review;
            archiveForDays = policyPayload.options.archive_for_days;
            displayFields = policyPayload.options.display_fields;
            allowEmptyFields = policyPayload.options.allow_empty_fields;
            allowFieldUpdates = policyPayload.options.allow_field_updates;
            certificationFields = policyPayload.options.certification_fields;
            instruction = policyPayload.options.instructions;
            this._updatePolicyOptions(policyId, policyType, taskDueInDays, subflow, needsReview, archiveForDays, displayFields, certificationFields, instruction, allowEmptyFields, allowFieldUpdates);
        }
        if (!gs.nil(policyPayload.data_filter)) {
            table = policyPayload.data_filter.table;
            encodedQuery = policyPayload.data_filter.encoded_query;
            this._updatePolicyDataFilter(policyId, table, encodedQuery);
        }
        if (!gs.nil(policyPayload.assignment)) {
            assignmentType = policyPayload.assignment.task_assignment_type;
            specificGroup = policyPayload.assignment.user_group;
            groupField = policyPayload.assignment.task_management_group;
            specificUser = policyPayload.assignment.user;
            userField = policyPayload.assignment.task_management_user;
            fieldPath = policyPayload.assignment.task_management_field_path;
			emptyAssignmentAction = policyPayload.assignment.empty_assignment_action;
			emptyAssignmentValue = policyPayload.assignment.empty_assignment_value;
            this._updatePolicyAssignment(policyId, assignmentType, specificGroup, groupField, specificUser, userField, fieldPath, emptyAssignmentAction, emptyAssignmentValue);
        }
        if (!gs.nil(policyPayload.schedule)) {
            runType = policyPayload.schedule.run_type;
            runTime = policyPayload.schedule.run_time;
            runStart = policyPayload.schedule.run_start;
            runPeriod = policyPayload.schedule.run_period;
            runDayOfWeek = policyPayload.schedule.run_dayofweek;
            runDayOfMonth = policyPayload.schedule.run_dayofmonth;
			runUser = policyPayload.schedule.run_user;
            this._updatePolicySchedule(policyId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth, runUser);
        }
    },

    /**
     * Update Policy general info
     * @param {*} policyId 
     * @param {*} name 
     * @param {*} description 
     * @param {*} policyType 
     * @param {*} worknotes 
     */
    _updatePolicyGeneralInfo: function(policyId, name, description, policyType, workNotes) {
        CMDBWsDMUtil.validateRequiredParam(policyId, {
            source: this.ACTIONS.DM_UPDATE_POLICY_GENERAL_INFO,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
            details: "Policy ID is required when updating policy general info",
        });
        CMDBWsDMUtil.validateRequiredParam(name, {
            source: this.ACTIONS.DM_UPDATE_POLICY_GENERAL_INFO,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy name is required"),
            details: "Policy name is required when updating policy general info",
        });
        CMDBWsDMUtil.validateRequiredParam(policyType, {
            source: this.ACTIONS.DM_UPDATE_POLICY_GENERAL_INFO,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy type is required"),
            details: "Policy type is required when updating policy general info",
        });

        var policyGr = this._policyAccessor.getPolicyById(policyId, true);
        var previousName = policyGr.getValue(this.POLICY.NAME);
        policyGr.setValue(this.POLICY.NAME, name);
        policyGr.setValue(this.POLICY.DESCRIPTION, description);
        var jobId = policyGr.getValue(this.POLICY.POLICY_EXECUTION_JOB);
        var previousPolicyType = policyGr.getValue(this.POLICY.TYPE);
        var policyRuntimeAttGr = this._policyAccessor.getPolicyRuntimeAttribute(policyId);
        var policyStatus = policyRuntimeAttGr.getValue(this.RUNTIME_ATTRIBUTE.STATUS);

        if (previousName != name && !gs.nil(jobId)) {
            var jobGr = this._policyJobAccessor.getPolicyScheduledJobById(jobId);
            this._policyJobAccessor.setName(jobGr, name);
            jobGr.update();
        }

        if (previousPolicyType != policyType) {
            // Don't allow changing policy type if policy is in published state
            if (policyStatus == this.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.PUBLISHED) {
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_FAILED_UPDATE,
                    action: this.ACTIONS.DM_UPDATE_POLICY_GENERAL_INFO,
                    source: this.DM_ERROR_SOURCE,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Updating policy type is not allowed for published policy. Current policy status is {0}", {
                        0: policyStatus
                    }),
                    details: "Updating policy type is not allowed for published policy"
                });
            } else {
                this._handlePolicyTypeChange(policyId, policyType); //clear out remaining policy info
            }
        }

        if (!gs.nil(workNotes)) {
            policyGr[this.POLICY.WORK_NOTES] = workNotes;
        }
        return policyGr.update();
    },

    _handlePolicyTypeChange: function(policyId, newPolicyTypeId) {
        var policyGr = this._policyAccessor.getPolicyById(policyId, true);
        var previousPolicyType = policyGr.getValue(this.POLICY.TYPE);

        policyGr.setValue(this.POLICY.TYPE, newPolicyTypeId);
        var policyTypeGr = this._policyAccessor.getPolicyTypeById(newPolicyTypeId, true);
        // If policy type changed from certification to other type or vice versa, then update the sys_class_name
        if (newPolicyTypeId == this.OOB_POLICY_TYPES.CERTIFICATION.sys_id && previousPolicyType != this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
            policyGr.setValue(this.SYS_CLASS_NAME, this.CERTIFICATION_POLICY.TABLE);
        } else if (newPolicyTypeId != this.OOB_POLICY_TYPES.CERTIFICATION.sys_id && previousPolicyType == this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
            policyGr.setValue(this.SYS_CLASS_NAME, this.POLICY.TABLE);
        }
        if (!policyTypeGr.per_policy_schedule) {
            var jobId = policyGr.getValue(this.POLICY.POLICY_EXECUTION_JOB);
            if (!gs.nil(jobId)) {
                policyGr.setValue(this.POLICY.POLICY_EXECUTION_JOB, "");
                this._policyJobAccessor.deletePolicyScheduledJob(jobId);
            }
        }
        policyGr.update();
        this._resetPolicyOptions(policyId, newPolicyTypeId);
        if (newPolicyTypeId == this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id) {
            this._updatePolicyDataFilter(policyId, this.DEFAULT_RELATED_ENTRY_TABLE, '');
        } else {
            this._updatePolicyDataFilter(policyId, this.DEFAULT_POLICY_TABLE, this.DEFAULT_ENCODED_QUERY);
        }
        this._updatePolicyAssignment(policyId, this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD, '', '', '', '', '');
    },

    /**
     * Update Policy Data filter
     * @param {*} policyId 
     * @param {*} table 
     * @param {*} encodedQuery 
     */
    _updatePolicyDataFilter: function(policyId, table, encodedQuery) {
        CMDBWsDMUtil.validateRequiredParam(policyId, {
            action: this.ACTIONS.DM_UPDATE_POLICY_DATA_FILTER,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
            details: "Policy ID is required when updating policy data filter",
        });
        CMDBWsDMUtil.validateRequiredParam(table, {
            action: this.ACTIONS.DM_UPDATE_POLICY_DATA_FILTER,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Table is required"),
            details: "Table is required when updating policy data filter",
        });

        var policyGr = new CMDBWsDMPolicyAccessor().getPolicyById(policyId, true);
        var oldTable = policyGr.getValue(this.POLICY.TABLE_COL);
        var policyType = policyGr.getValue(this.POLICY.TYPE);
        policyGr.setValue(this.POLICY.TABLE_COL, table);
        policyGr.setValue(this.POLICY.ENCODED_QUERY, encodedQuery);

        if(table != oldTable){
            this._handlePolicyTableChange(policyId, policyType);
        }

        return policyGr.update();
    },

    _handlePolicyTableChange: function(policyId, policyType) {
        this._resetPolicyOptions(policyId, policyType);
        this._updatePolicyAssignment(policyId, this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD, '', '', '', '', '');
    },

    /**
     * Update policy assignment
     * @param {*} policyId
     * @param {*} assignmentType 
     * @param {*} specificGroup 
     * @param {*} groupField 
     * @param {*} specificUser
     */
    _updatePolicyAssignment: function(policyId, assignmentType, specificGroup, groupField, specificUser, userField, fieldPath, emptyAssignmentAction, emptyAssignmentValue) {
        CMDBWsDMUtil.validateRequiredParam(policyId, {
            action: this.ACTIONS.DM_UPDATE_POLICY_ASSIGNMENT,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
            details: "Policy ID is required when updating policy assignment",
        });
        CMDBWsDMUtil.validateRequiredParam(assignmentType, {
            action: this.ACTIONS.DM_UPDATE_POLICY_ASSIGNMENT,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Assignment type is required."),
            details: "Assignment type is required when updating policy assignment",
        });

        var policyGr = new CMDBWsDMPolicyAccessor().getPolicyById(policyId, true);
        policyGr.setValue(this.POLICY.TASK_MANAGEMENT_GROUP, '');
        policyGr.setValue(this.POLICY.TASK_MANAGEMENT_USER, '');
        policyGr.setValue(this.POLICY.USER, '');
        policyGr.setValue(this.POLICY.USER_GROUP, '');
        policyGr.setValue(this.POLICY.TASK_ASSIGNMENT_TYPE, '');
		policyGr.setValue(this.POLICY.UNASSIGNED_TASK_ASSIGNEE, '');
		if(emptyAssignmentAction == this.POLICY.UNASSIGNED_TASK_POLICY_OPTIONS.CREATE_ASSIGNED_TASK){
			if(assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD){
				policyGr.setValue(this.POLICY.UNASSIGNED_TASK_ACTION, this.POLICY.UNASSIGNED_TASK_OPTIONS.CREATE_ASSIGNED_TASK_TO_GROUP);
				policyGr.setValue(this.POLICY.UNASSIGNED_TASK_ASSIGNMENT_TYPE, this.POLICY.UNASSIGNED_TABLE_TYPES.USER_GROUP);
			} else if(assignmentType == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.USER_FIELD){
				policyGr.setValue(this.POLICY.UNASSIGNED_TASK_ACTION, this.POLICY.UNASSIGNED_TASK_OPTIONS.CREATE_ASSIGNED_TASK_TO_USER);
				policyGr.setValue(this.POLICY.UNASSIGNED_TASK_ASSIGNMENT_TYPE, this.POLICY.UNASSIGNED_TABLE_TYPES.USER);
			}
			policyGr.setValue(this.POLICY.UNASSIGNED_TASK_ASSIGNEE, emptyAssignmentValue);
		} else {
			policyGr.setValue(this.POLICY.UNASSIGNED_TASK_ACTION, this.POLICY.UNASSIGNED_TASK_OPTIONS.CREATE_UNASSIGNED_TASK);
		}

        if (this.SUPPORTS_DOT_WALK_ASSIGNMENT)
            policyGr.setValue(this.POLICY.TASK_MANAGEMENT_FIELD_PATH, '');
        switch (assignmentType) {
            case this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD:
                return this._setPolicyAssignmentToGroupField(policyGr, assignmentType, groupField, fieldPath);
            case this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_USER:
                return this._setPolicyAssignmentToSpecificUser(policyGr, assignmentType, specificUser);
            case this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_GROUP:
                return this._setPolicyAssignmentToSpecificGroup(policyGr, assignmentType, specificGroup);
            case this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.USER_FIELD:
                return this._setPolicyAssignmentToUserField(policyGr, assignmentType, userField, fieldPath);
            default:
                throw new CMDBWsError({
                    code: this.ERROR_CODES.DM_FAILED_UPDATE,
                    action: this.ACTIONS.DM_UPDATE_POLICY_ASSIGNMENT,
                    source: this.DM_ERROR_SOURCE,
                    message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Unidentified assignment type"),
                    details: "Unidentified assignment type"
                });
        }
    },

    /* setter method for policy assignment  */
    _setPolicyAssignmentToSpecificGroup: function(policyGr, assignmentType, specificGroup) {
        // This function should clear out value set for groupField, specificUser, userField by setting empty value
        policyGr.setValue(this.POLICY.TASK_ASSIGNMENT_TYPE, assignmentType);
        policyGr.setValue(this.POLICY.USER_GROUP, specificGroup);
        return policyGr.update();
    },

    _setPolicyAssignmentToSpecificUser: function(policyGr, assignmentType, specificUser) {
        // This function should clear out value set for groupField, specificGroup, userField by setting empty value
        policyGr.setValue(this.POLICY.TASK_ASSIGNMENT_TYPE, assignmentType);
        policyGr.setValue(this.POLICY.USER, specificUser);
        return policyGr.update();
    },

    _setPolicyAssignmentToGroupField: function(policyGr, assignmentType, groupField, fieldPath) {
        // This function should clear out value set for specificUser, specificGroup, userField by setting empty value
        policyGr.setValue(this.POLICY.TASK_ASSIGNMENT_TYPE, assignmentType);
        if (this.SUPPORTS_DOT_WALK_ASSIGNMENT) {
            if (gs.nil(fieldPath)) {
                var grSysDictionary = new GlideRecord(this.SYS_DICTIONARY.TABLE);
                if (grSysDictionary.get(groupField)) {
                    fieldPath = grSysDictionary.getValue(this.SYS_DICTIONARY.ELEMENT);
                }
            }
            policyGr.setValue(this.POLICY.TASK_MANAGEMENT_FIELD_PATH, fieldPath);
            } else {
                policyGr.setValue(this.POLICY.TASK_MANAGEMENT_GROUP, groupField);
            }
        return policyGr.update();
    },

    _setPolicyAssignmentToUserField: function(policyGr, assignmentType, userField, fieldPath) {
        policyGr.setValue(this.POLICY.TASK_ASSIGNMENT_TYPE, assignmentType);
        if (this.SUPPORTS_DOT_WALK_ASSIGNMENT) {
            if (gs.nil(fieldPath)) {
                var grSysDictionary = new GlideRecord(this.SYS_DICTIONARY.TABLE);
                if (grSysDictionary.get(userField)) {
                    fieldPath = grSysDictionary.getValue(this.SYS_DICTIONARY.ELEMENT);
                }
            }
            policyGr.setValue(this.POLICY.TASK_MANAGEMENT_FIELD_PATH, fieldPath);
        } else {
            policyGr.setValue(this.POLICY.TASK_MANAGEMENT_USER, userField);
        }
        return policyGr.update();
    },

    _updatePolicyOptions: function(policyId, policyType, taskDueInDays, subflow, needsReview, archiveForDays, displayFields, certificationFields, instruction, allowEmptyFields, allowFieldUpdates) {
        var policyGr = this._resetPolicyOptions(policyId, policyType);
        if (policyType == this.OOB_POLICY_TYPES.ARCHIVE.sys_id) {
            return this._setArchivePolicyOptions(policyGr, subflow, needsReview, archiveForDays);
        } else if (policyType == this.OOB_POLICY_TYPES.ATTESTATION.sys_id) {
            return this._setAttestationPolicyOptions(policyGr, taskDueInDays);
        } else if (policyType == this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
            return this._setDataCertificationPolicyOptions(policyGr, displayFields, certificationFields, instruction, taskDueInDays, allowEmptyFields, allowFieldUpdates);
        } else if (policyType == this.OOB_POLICY_TYPES.RETIRE.sys_id) {
            return this._setRetirePolicyOptions(policyGr, subflow, needsReview);
        } else if (policyType == this.OOB_POLICY_TYPES.DELETE.sys_id) {
            return this._setDeletePolicyOptions(policyGr, subflow, needsReview);
        } else if (policyType == this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id) {
            return this._setDeleteRelatedEntryPolicyOptions(policyGr, subflow, needsReview);
        }
    },

    _resetPolicyOptions: function(policyId, policyType) {
        var policyGr;
        if(policyType != this.OOB_POLICY_TYPES.CERTIFICATION.sys_id){
            policyGr = this._policyAccessor.getPolicyById(policyId, true);
            policyGr.setValue(this.POLICY.TASK_DUE_IN_DAYS, 0);
            policyGr.setValue(this.POLICY.SUBFLOW_ID, '');
            policyGr.setValue(this.POLICY.ARCHIVE_FOR_DAYS, 0);
            policyGr.setValue(this.POLICY.NEEDS_REVIEW, false);
            policyGr.update();
        } else {
            policyGr = this._policyAccessor.getCertificationPolicyById(policyId, true);
            policyGr.setValue(this.POLICY.TASK_DUE_IN_DAYS, 0);
            policyGr.setValue(this.POLICY.SUBFLOW_ID, '');
            policyGr.setValue(this.POLICY.ARCHIVE_FOR_DAYS, 0);
            policyGr.setValue(this.POLICY.NEEDS_REVIEW, false);
            policyGr.setValue(this.CERTIFICATION_POLICY.DISPLAY_FIELDS, '');
            policyGr.setValue(this.CERTIFICATION_POLICY.CERTIFICATION_FIELDS, '');
            policyGr.setValue(this.CERTIFICATION_POLICY.INSTRUCTIONS, '');
            policyGr.update();
        }
        return policyGr;
    },

    /* setter method each for specific policy type  */
    _setRetirePolicyOptions: function(policyGr, subflow, needsReview) {
        this._validateSubflow(subflow, policyGr.getValue(this.POLICY.TYPE));
        policyGr.setValue(this.POLICY.SUBFLOW_ID, subflow);
        policyGr.setValue(this.POLICY.NEEDS_REVIEW, needsReview);
        return policyGr.update();
    },

    _setDeletePolicyOptions: function(policyGr, subflow, needsReview) {
        this._validateSubflow(subflow, policyGr.getValue(this.POLICY.TYPE));
        policyGr.setValue(this.POLICY.SUBFLOW_ID, subflow);
        policyGr.setValue(this.POLICY.NEEDS_REVIEW, needsReview);
        return policyGr.update();
    },

    _setArchivePolicyOptions: function(policyGr, subflow, needsReview, archiveForDays) {
        this._validateSubflow(subflow, policyGr.getValue(this.POLICY.TYPE));
        policyGr.setValue(this.POLICY.SUBFLOW_ID, subflow);
        policyGr.setValue(this.POLICY.NEEDS_REVIEW, needsReview);
        policyGr.setValue(this.POLICY.ARCHIVE_FOR_DAYS, archiveForDays);
        return policyGr.update();
    },

    _setDataCertificationPolicyOptions: function(policyGr, displayFields, certificationFields, instruction, taskDueInDays, allowEmptyFields, allowFieldUpdates) {
        policyGr.setValue(this.CERTIFICATION_POLICY.DISPLAY_FIELDS, displayFields);
        policyGr.setValue(this.CERTIFICATION_POLICY.CERTIFICATION_FIELDS, certificationFields);
        policyGr.setValue(this.CERTIFICATION_POLICY.INSTRUCTIONS, instruction);
        policyGr.setValue(this.POLICY.TASK_DUE_IN_DAYS, taskDueInDays);
        policyGr.setValue(this.CERTIFICATION_POLICY.ALLOW_EMPTY_FIELDS, allowEmptyFields);
        policyGr.setValue(this.CERTIFICATION_POLICY.ALLOW_FIELD_UPDATES, allowFieldUpdates);
        return policyGr.update();
    },

    _setAttestationPolicyOptions: function(policyGr, taskDueInDays) {
        policyGr.setValue(this.POLICY.TASK_DUE_IN_DAYS, taskDueInDays);
        return policyGr.update();
    },

    _setDeleteRelatedEntryPolicyOptions: function(policyGr, subflow, needsReview) {
        this._validateSubflow(subflow, policyGr.getValue(this.POLICY.TYPE));
        policyGr.setValue(this.POLICY.SUBFLOW_ID, subflow);
        policyGr.setValue(this.POLICY.NEEDS_REVIEW, needsReview);
        return policyGr.update();
    },

    _validateSubflow: function(subflowId, policyTypeId) {
        CMDBWsDMUtil.validateRequiredParam(subflowId, {
            source: this.ACTIONS.DM_UPDATE_POLICY_OPTIONS,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Subflow is required"),
            details: "Subflow ID is required when updating policy options",
        });
        var subflowGr = new GlideRecord(this.SUBFLOW.TABLE);
        subflowGr.get(subflowId);
        if (!subflowGr.isValidRecord()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Selected subflow({0}) does not exist", {
                    0: subflowId
                }),
                source: this.ACTIONS.DM_UPDATE_POLICY_OPTIONS,
                details: "Invalid subflow=" + subflowId,
                logError: true
            });
        }
        var subflowCategory = subflowGr.getValue(this.SUBFLOW.CATEGORY);
        var policyTypeCategoryGr = new GlideRecord(this.CMDB_POLICY_TYPE_CATEGORIES.TABLE);
        policyTypeCategoryGr.addQuery(this.CMDB_POLICY_TYPE_CATEGORIES.CMDB_POLICY_TYPE, policyTypeId);
        policyTypeCategoryGr.addQuery(this.CMDB_POLICY_TYPE_CATEGORIES.SUBFLOW_CATEGORY, subflowCategory);
        policyTypeCategoryGr.setLimit(1);
        policyTypeCategoryGr.query();
        if (!policyTypeCategoryGr.hasNext()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Selected subflow is not associated with this policy type", {
                    0: subflowId,
                    1: policyTypeId
                }),
                source: this.ACTIONS.DM_UPDATE_POLICY_OPTIONS,
                details: "Invalid subflow " + subflowId + " selected for policy type " + policyTypeId,
                logError: true
            });
        }
    },

    /**
     * Update policy schedule.
     * 
     * @param {*} runType 
     * @param {*} runTime 
     * @param {*} runStart 
     * @param {*} runPeriod 
     * @param {*} runDayOfWeek 
     * @param {*} runDayOfMonth 
	 * @param {*} runUser
     */
    updatePolicySchedule: function(policyId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth, runUser) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_UPDATE_POLICY_SCHEDULE, this._updatePolicySchedule, policyId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth, runUser);
    },

    _updatePolicySchedule: function(policyId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth, runUser) {
        var policyGr = this._policyAccessor.getPolicyById(policyId);
        if (!policyGr.cmdb_policy_type.per_policy_schedule) {
            return;
        }
        var jobId = policyGr.getValue(this.POLICY.POLICY_EXECUTION_JOB);
        if (gs.nil(jobId)) {
            this._policyJobAccessor.createPolicySchedule(policyId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth, runUser);
        } else {
            this._policyJobAccessor.updatePolicySchedule(jobId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth, runUser, policyId);
        }
    },

    /**
     * Publish policy
     * @param {*} policyId 
     */
    publishPolicy: function(policyId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_PUBLISH_POLICY, this._publishPolicy, policyId);
    },

    _publishPolicy: function(policyId) {
        CMDBWsDMUtil.validateRequiredParam(policyId, {
            action: this.ACTIONS.DM_PUBLISH_POLICY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID cannot be empty"),
            details: "Policy ID is required to publish a policy",
        });

        var policyDto = new CMDBWsDMPolicyDto(policyId);
        policyDto.validate();
        this._policyAccessor.updatePolicyStatus(policyId, this.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.PUBLISHED);
        this._updateScheduledJobActiveFlag(policyId, true);
    },

    /**
     * Activate/deactivate the policy
     * @param {*} policyId 
     * @param {*} flag: boolean value of true/false. True means activate and false means deactivate
     */
    activatePolicy: function(policyId, flag) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_ACTIVATE_POLICY, this._activatePolicy, policyId, flag);
    },

    _activatePolicy: function(policyId, flag) {
        if (flag == true)
            this._publishPolicy(policyId); //activate
        else {
            //deactivate
            this._policyAccessor.updatePolicyStatus(policyId, this.RUNTIME_ATTRIBUTE.STATUS_OPTIONS.INACTIVE);
            this._updateScheduledJobActiveFlag(policyId, false);
        }
    },
    _updateScheduledJobActiveFlag: function(policyId, flag) {
        var policyGr = this._policyAccessor.getPolicyById(policyId);
        if (policyGr.cmdb_policy_type.per_policy_schedule) {
            var jobId = policyGr.getValue(this.POLICY.POLICY_EXECUTION_JOB);
            if (gs.nil(jobId))
                return;
            this._policyJobAccessor.activatePolicyScheduledJob(jobId, flag);
        }
    },
    /**
     * Delete Policy
     * @param {*} policyId 
     */
    deletePolicy: function(policyId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DELETE_POLICY, this._deletePolicy, policyId);
    },

    _deletePolicy: function(policyId) {
        this._policyAccessor.deletePolicy(policyId);
    },

    /**
     * Delete Selected Policies
     * @param {*} encodedQuery
     * @param {*} runTimeAttrSysIds
     */
    deleteSelectedPolicies: function(encodedQuery, runTimeAttrSysIds) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DELETE_POLICIES, this._deleteSelectedPolicies, encodedQuery, runTimeAttrSysIds);
    },

    _deleteSelectedPolicies: function(encodedQuery, runTimeAttrSysIds) {
        this._policyAccessor.deleteSelectedPolicies(encodedQuery, runTimeAttrSysIds);
    },

    /**
     * Mark Policies for Deletion
     * @param {*} encodedQuery
     * @param {*} runTimeAttrSysIds
     */
    markPoliciesForDeletion: function(encodedQuery, runTimeAttrSysIds) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DELETE_POLICIES, this._markPoliciesForDeletion, encodedQuery, runTimeAttrSysIds);
    },

    _markPoliciesForDeletion: function(encodedQuery, runTimeAttrSysIds) {
        this._policyAccessor.markPoliciesForDeletion(encodedQuery, runTimeAttrSysIds);
    },

    /**
     * Gets encoded query for preview for given policy Id
     * @param {*} policyId
     * @returns: CMDBWsDMPolicyDataFilterDto object
     * }
     */
    getDataFilterForPreview: function(policyId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_DATA_FILTER, this._getDataFilterForPreview, policyId);
    },

    _getDataFilterForPreview: function(policyId) {
        CMDBWsDMUtil.validateRequiredParam(
            policyId, {
                action: this.ACTIONS.DM_GET_DATA_FILTER,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
                details: "Policy ID is required when fetching data filter",
            }
        );
        var policyGr = this._policyAccessor.getPolicyById(policyId);
        var dataFilter = new CMDBWsDMPolicyDataFilterDto();
        dataFilter.populate(policyGr);
        return dataFilter;
    },

    /**
     * Builds encoded query for preview for given policyTypeId, table and encoded query
     * @param {*} policyTypeId
     * @param {*} policyTable
     * @param {*} encodedQuery
     * @returns: {
     *   table: "",
     *   encodedQuery: "",
     *   enforcedCondition: "",
     *   list_filter: ""
     * }
     */
    buildDataFilterForPreview: function(policyTypeId, policyTable, encodedQuery) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_DATA_FILTER, this._buildDataFilterForPreview, policyTypeId, policyTable, encodedQuery);
    },

    _buildDataFilterForPreview: function(policyTypeId, policyTable, encodedQuery) {
        CMDBWsDMUtil.validateRequiredParam(
            policyTypeId, {
                action: this.ACTIONS.DM_GET_DATA_FILTER,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy Type ID is required"),
                details: "Policy Type ID is required when fetching data filter",
            }
        );
        var dataFilter = new CMDBWsDMPolicyDataFilterDto();
        dataFilter.buildDataFilterForPreview(policyTypeId, policyTable, encodedQuery, true);
        return dataFilter;
    },

    /**
     * Get Eligible Tables
     * @param {*} policyId 
     * @returns: Array of eligible tables
     * [
     *  {
     *      "id": "",
     *      "label" : "",
     *      "sublabel"  : ""
     *  }
     * ]
     */
    getEligibleTables: function(policyId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_ELIGIBLE_TABLES, this._getEligibleTables, policyId);
    },

    _getEligibleTables: function(policyId) {
        CMDBWsDMUtil.validateRequiredParam(
            policyId, {
                action: this.ACTIONS.DM_GET_ELIGIBLE_TABLES,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
                details: "Policy ID is required when fetching eligible tables list",
            });
        var policyGr = this._policyAccessor.getPolicyById(policyId);
        var policyType = policyGr.getValue(this.POLICY.TYPE);
        var eligibleTables = [];
        var util = new CMDBWorkspaceUtil();

        if (policyType == this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id) {
            eligibleTables = util.getRelatedEntryTables();
        } else {
            eligibleTables = util.getCmdbTables();
        }

        return eligibleTables;
    },
    /**
     * Get available assignment type options
     *@returns: Array of assignment type options
     * [
     *  {
     *      "label": "",
     *      "name" : "",
     *      "sys_id" : ""
     *  }
     * ]
     */
    getAssignmentTypeOptions: function(table) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_ASSIGNMENT_OPTIONS, this._getAssignmentTypeOptions, table);
    },

    /**
     * Get the available assignment type options
     * @param {*} table
     *@returns: Array of assignment type options
     * [
     *  {
     *      "label": "",
     *      "value" : ""
     *  }
     * ]
     */
    _getAssignmentTypeOptions: function(table) {
        var results = [];
        var choiceList = GlideChoiceList.getChoiceList(this.POLICY.TABLE, this.POLICY.TASK_ASSIGNMENT_TYPE);
        for (var i = 0; i < choiceList.getSize(); i++) {
            var choice = choiceList.getChoice(i);
            var assignmentType = {
                label: choice.getLabel(),
                value: choice.getValue()
            };
            if (!this.SUPPORTS_DOT_WALK_ASSIGNMENT) {
                if (assignmentType.value == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD) {
                    if (!this._hasReferenceFieldsForTableByType(table, this.SYS_DICTIONARY.SYS_USER_GROUP)) {
                        continue;
                    }
                }
                if (assignmentType.value == this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.USER_FIELD) {
                    if (!this._hasReferenceFieldsForTableByType(table, this.SYS_USER.TABLE)) {
                        continue;
                    }
                }
            }
            results.push(assignmentType);
        }
        return results;
    },

    _hasReferenceFieldsForTableByType: function(table, type) {
        var gr = new GlideRecord(this.SYS_DICTIONARY.TABLE);
        gr.addQuery(this.NAME, table);
        gr.addQuery(this.SYS_DICTIONARY.REFERENCE, type);
        gr.addQuery(this.SYS_DICTIONARY.INTERNAL_TYPE, this.SYS_DICTIONARY.REFERENCE);
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    /**
     * Get the reference fields for a given table and type
     * @param {*} table
     * @param {*} type (table of reference field)
     *@returns: Array of group fields
     * [
     *  {
     *      "label": "",
     *      "name" : "",
     *      "sys_id" : ""
     *  }
     * ]
     */
    getReferenceFieldsForTableByType: function(table, type) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_ASSIGNMENT_OPTIONS, this._getReferenceFieldsForTableByType, table, type);
    },

    _getReferenceFieldsForTableByType: function(table, type) {
        var results = [];
	var references = [];
        var gr = new GlideRecord(this.SYS_DICTIONARY.TABLE);
        var glideTableHierarchy = new GlideTableHierarchy(table);
        var parentTables = glideTableHierarchy.getTables();
        gr.addQuery(this.NAME, this.IN, parentTables);
        if (type)
            gr.addQuery(this.SYS_DICTIONARY.REFERENCE, type);
        gr.addQuery(this.SYS_DICTIONARY.INTERNAL_TYPE, this.SYS_DICTIONARY.REFERENCE);
        gr.orderBy(this.SYS_DICTIONARY.COLUMN_LABEL);
        gr.query();
        while (gr.next()) {
            if (references.indexOf(gr.getValue(this.SYS_DICTIONARY.ELEMENT)) === -1) {
                var field = {};
                field.label = gr.getDisplayValue(this.SYS_DICTIONARY.COLUMN_LABEL);
                field.name = gr.getValue(this.SYS_DICTIONARY.ELEMENT);
                field.sys_id = gr.getValue(this.SYS_ID);
                field.type = gr.getValue(this.SYS_DICTIONARY.REFERENCE);
                references.push(field.name);
                results.push(field);
            }
        }
        return results;
    },

    /**
     * Get all groups which have the data manager user role or at least 1 member with the data manager user role
     * @returns: Array of groups
     * [
     *  {
     *      "value": "",
     *      "name" : ""
     *  }
     * ]
     */
	getDataManagerUserGroups: function(searchTerm) {
		return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_ASSIGNMENT_OPTIONS, this._getDataManagerUserGroups, searchTerm);
	},

	_getDataManagerUserGroups: function(searchTerm) {
		var data_manager_user = this.ASSIGNMENT.DM_USER_ROLE_SYS_ID;
		var groupSysId = [];
		var userSysId = [];
		var role = this.ASSIGNMENT.ROLE;

		var groups = [];
		if (global.JSUtil.nil(searchTerm) || searchTerm.length < 3) {
			return groups;
		}
		var groupMap = {};
		var gr = new GlideRecord(this.SYS_DICTIONARY.SYS_USER_GROUP);
		gr.addQuery(this.NAME, 'CONTAINS', searchTerm);
		gr.addQuery(this.ACTIVE, 'true');
		gr.orderBy(this.NAME);
		gr.setLimit(this.UI_DEFAULT_LIMIT.DATA_FILTER_TABLE_SEARCH_RESULTS_LIMIT);
		gr.query();
		while (gr.next()) {
			groupMap[gr.getUniqueValue()] = gr.getValue(this.NAME);
		}

		var groupIds = Object.keys(groupMap);
		var validGroupIds = [];
		var initialCount = groupIds.length;
		//get the groups which has data_manager_user role associated 
		var gr = new GlideRecord(this.SYS_GROUP_HAS_ROLE.TABLE);
		gr.addQuery(this.GROUP, groupIds);
		gr.addQuery(role, data_manager_user);
		gr.query();
		while (gr.next()) {
			validGroupIds.push(gr.getValue(this.GROUP));
		}

		if (validGroupIds.length < initialCount) {
			for (i = groupIds.length - 1; i >= 0; i--) {
				if (validGroupIds.indexOf(groupIds[i]) > -1) {
					groupIds.splice(i, 1);
				}
			}
			var userToGroupMap = {};
			gr = new GlideRecord(this.SYS_USER_GROUP_MEMBER.TABLE);
			gr.addQuery(this.SYS_USER_GROUP_MEMBER.GROUP, groupIds);
			gr.query();
			while (gr.next()) {
				var userId = gr.getValue(this.SYS_USER_GROUP_MEMBER.USER);
				var groupId = gr.getValue(this.SYS_USER_GROUP_MEMBER.GROUP);
				if (!userToGroupMap[userId]) {
					userToGroupMap[userId] = [];
				}
				userToGroupMap[userId].push(groupId);
			}
			var userIds = Object.keys(userToGroupMap);
			gr = new GlideRecord(this.SYS_USER_HAS_ROLE.TABLE);
			gr.addQuery(this.USER, userIds);
			gr.addQuery(role, data_manager_user);
			gr.query();
			while (gr.next()) {
				var ids = userToGroupMap[gr.getValue(this.USER)];
				for (var i = 0; i < ids.length; i++) {
					if (validGroupIds.indexOf(ids[i]) < 0) {
						validGroupIds.push(ids[i]);
					}
				}
			}
		}

		for (var i = 0; i < validGroupIds.length; i++) {
			groups.push({
				value: validGroupIds[i],
				name: groupMap[validGroupIds[i]]
			});
		}

		return groups;
	},

    /**
     * Get all users or groups which have the data manager user role
     * @returns: Array of users or groups
     * [
     *  {
     *      "value": "",
     *      "name" : ""
     *  }
     * ]
     */
    getSearchResults: function(args) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_ASSIGNMENT_OPTIONS, this._getSearchResults, args);
    },

    _getSearchResults: function(args) {
        var searchTerm = args.searchTerm;
        var userGroupAssignmentSysId = args.userGroupAssignmentSysId;
        var userAssignmentSysId = args.userAssignmentSysId;
        var isGroupSearch = args.hasOwnProperty("userGroupAssignmentSysId");
        var isUserSearch = args.hasOwnProperty("userAssignmentSysId");
        var data_manager_user = this.ASSIGNMENT.DM_USER_ROLE_SYS_ID;
        var groupSysId = [];
        var userSysId = [];
        var userSysIdGroupMap = {};
        var results = [];
        var role = this.ASSIGNMENT.ROLE;
        var gr;
        var shouldAddMissingSelectedGroup = true;
        var shouldAddMissingSelectedUser = true;

        // If loading an existing policy, we need to resolve the saved displayName
        if ((userGroupAssignmentSysId || userAssignmentSysId) && !searchTerm) {
            var sysId;
            if (isGroupSearch) {
            gr = new GlideRecord(this.SYS_DICTIONARY.SYS_USER_GROUP);
                sysId = userGroupAssignmentSysId;
            } else {
                gr = new GlideRecord(this.SYS_USER.TABLE);
                sysId = userAssignmentSysId;
            }
            if (gr.get(sysId)) {
                return ([{
                    value: gr.getUniqueValue(),
                    name: gr.getValue(this.NAME)
                }]);
            }
        }

        // this is also controlled on the client but if it gets here, return empty for too short of string length
        if (!searchTerm || searchTerm.length < 3)
            return ([]);

        if (isGroupSearch) {
            // Fetch the groups directly from the sys_user_grmember table
            gr = new GlideRecord(this.SYS_USER_GROUP_MEMBER.TABLE);
            gr.addEncodedQuery('group.nameSTARTSWITH' + searchTerm + '^group.active=true');
            gr.query();

            while (gr.next()) {
                if (!userSysIdGroupMap[gr.getValue(this.USER)])
                    userSysIdGroupMap[gr.getValue(this.USER)] = [];

                userSysIdGroupMap[gr.getValue(this.USER)].push(gr.getValue(this.GROUP));
            }
        } else if (isUserSearch) {
            gr = new GlideRecord(this.SYS_USER_HAS_ROLE.TABLE);
            gr.addQuery(role, data_manager_user);
            gr.addEncodedQuery('user.nameSTARTSWITH' + searchTerm);
            gr.query();

            while (gr.next()) {
                userSysId.push(gr.getValue(this.USER));
            }
        }
        //get the users of the specified groups from STARTSWITH query who are a data_manager_user in batches
        var userArray = isGroupSearch ? Object.keys(userSysIdGroupMap) : userSysId;
        var batch = 0;
        var batchSize = 1000;
        var maxLimit = 0;
        while (batch < userArray.length) {
            if (isGroupSearch) {
                var userArrayBatch = userArray.slice(batch, batch + batchSize);
                gr = new GlideAggregate(this.SYS_USER_HAS_ROLE.TABLE);
                gr.addQuery(role, data_manager_user);
                gr.addQuery(this.USER, this.IN, userArrayBatch);
                gr.groupBy(this.USER);
                gr.query();
                while (gr.next()) {
                    groupSysId = groupSysId.concat(userSysIdGroupMap[gr.getValue(this.USER)]);
                }
                batch += batchSize;
                //get the group name & sys_ids
                var userGroupgr = new GlideRecord(this.SYS_DICTIONARY.SYS_USER_GROUP);
                userGroupgr.addQuery(this.SYS_ID, this.IN, groupSysId);
                userGroupgr.orderBy(this.NAME);
                userGroupgr.setLimit(this.UI_DEFAULT_LIMIT.ASSIGNMENT_SEARCH_RESULTS_LIMIT);
                userGroupgr.query();
                OuterLoop:
                while (userGroupgr.next()) {
                        maxLimit++;
                        results.push({
                        value: userGroupgr.getUniqueValue(),
                        name: userGroupgr.getValue(this.NAME)
                    });

                    if (userGroupAssignmentSysId === userGroupgr.getUniqueValue())
                        shouldAddMissingSelectedGroup = false;

                    if (maxLimit >= this.UI_DEFAULT_LIMIT.ASSIGNMENT_SEARCH_RESULTS_LIMIT)
                        break OuterLoop;
                }
            } else if (isUserSearch) {
                var userArrayBatch = userArray.slice(batch, batch + batchSize);
                batch += batchSize;
                gr = new GlideRecord(this.SYS_USER.TABLE);
                gr.addQuery(this.SYS_ID, this.IN, userArrayBatch);
                gr.addActiveQuery();
                gr.orderBy(this.NAME);
                gr.setLimit(this.UI_DEFAULT_LIMIT.ASSIGNMENT_SEARCH_RESULTS_LIMIT);
                gr.query();
                OuterLoop:
                while (gr.next()) {
                    maxLimit++;
                    results.push({
                        value: gr.getUniqueValue(),
                        name: gr.getValue(this.NAME)
                    });

                    if (userAssignmentSysId === gr.getUniqueValue())
                        shouldAddMissingSelectedUser = false;

                    if (maxLimit >= this.UI_DEFAULT_LIMIT.ASSIGNMENT_SEARCH_RESULTS_LIMIT)
                        break OuterLoop;
                }
            }
        }
        if (userGroupAssignmentSysId && shouldAddMissingSelectedGroup) {
            gr = new GlideRecord(this.SYS_DICTIONARY.SYS_USER_GROUP);
            if (gr.get(userGroupAssignmentSysId)) {
                results.push({
                    value: gr.getUniqueValue(),
                    name: gr.getValue(this.NAME)
                });
            }
        }
        if (userAssignmentSysId && shouldAddMissingSelectedUser) {
            gr = new GlideRecord(this.SYS_USER.TABLE);
            if (gr.get(userAssignmentSysId)) {
                results.push({
                    value: gr.getUniqueValue(),
                    name: gr.getValue(this.NAME)
                });
            }
        }
        return results;
    },

    /**
     * Get Upcoming Policy Schedules
     * @param {*} startDate Format:  GlideDateTime Object OR "YYYY-MM-DD HH:MM:SS"
     * @param {*} endDate Format:  GlideDateTime Object OR "YYYY-MM-DD HH:MM:SS"
     * @returns: Array of upto next 25 occurrences of the policy's scheduled executions
     * {
     * 	"PolicyType" : 
     *  [{
     *      "id": "",
     *      "name" : "",
     *      "time"  : "",
     * 		"epoch" : ""
     *  }]
     * }
     */
    getUpcomingSchedules: function(startDate, endDate) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_UPCOMING_SCHEDULES, this._getUpcomingSchedules, startDate, endDate);
    },

    _getUpcomingSchedules: function(start, end) {
        CMDBWsDMUtil.validateRequiredParam(
            start, {
                action: this.ACTIONS.DM_GET_UPCOMING_SCHEDULES,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Start date is required"),
                details: "Start date is required when fetching upcoming policy schedules",
            });

        CMDBWsDMUtil.validateRequiredParam(
            end, {
                action: this.ACTIONS.DM_GET_UPCOMING_SCHEDULES,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "End date is required"),
                details: "End date is required when fetching upcoming policy schedules",
            });
        var upcomingSchedules = {};
        var startDate = new GlideDateTime(start);
        var endDate = new GlideDateTime(end);

        var allowedPolicySysIds = this.OOB_POLICY_TYPES.ATTESTATION.sys_id + "," + this.OOB_POLICY_TYPES.CERTIFICATION.sys_id;
        var policyGr = new GlideRecord(this.POLICY.TABLE);
        policyGr.addQuery(this.POLICY.TYPE, "IN", allowedPolicySysIds);
        // Only for published policies
        policyGr.addEncodedQuery("RLQUERYcmdb_data_management_policy_runtime_attributes.policy,=1^status=Published^ENDRLQUERY");
        policyGr.query();

        var multiRecurrence = new sn_schdl_ns.GlideMultiRecurrence();

        while (policyGr.next()) {
            var nextOccurrences;
            var policyType = policyGr.getValue(this.POLICY.TYPE);
            var policyId = policyGr.getUniqueValue();
            var policyRuntimeGr = this._policyAccessor.getPolicyRuntimeAttribute(policyId);
            var policyRuntimeId = policyRuntimeGr.getUniqueValue();
            var policyName = policyGr.getValue(this.POLICY.NAME);
            var scheduledJob = policyGr.getValue(this.POLICY.POLICY_EXECUTION_JOB);

            if (gs.nil(scheduledJob))
                continue;

            var scheduleGr = new GlideRecord("sys_trigger");
            scheduleGr.addQuery("document_key", scheduledJob);
            scheduleGr.query();

            if (!upcomingSchedules.hasOwnProperty(policyType)) {
                upcomingSchedules[policyType] = [];
            }

            if (scheduleGr.next()) {
                if (scheduleGr.getValue("trigger_type") == 0) { // if the trigger type is Run Once, get the next_action date
                    var nextActionDt = new GlideDateTime(scheduleGr.getValue("next_action"));
                    if (nextActionDt >= startDate && nextActionDt <= endDate) {
                        upcomingSchedules[policyType].push({
                            "id": policyId,
                            "runtimeId": policyRuntimeId,
                            "name": policyName,
                            "time": nextActionDt.getDisplayValue(),
                            "epoch": nextActionDt.getNumericValue(),
                        });
                    }
                } else {
                    nextOccurrences = multiRecurrence.getOccurrences(scheduleGr);
                    nextOccurrences.forEach(function(occurrence) {
                        if (occurrence >= startDate && occurrence <= endDate) {
                            upcomingSchedules[policyType].push({
                                "id": policyId,
                                "runtimeId": policyRuntimeId,
                                "name": policyName,
                                "time": occurrence.getDisplayValue(),
                                "epoch": occurrence.getNumericValue(),
                            });
                        }
                    });
                }

            } else
                continue; //if for some reason sys_trigger entry takes time to created.
        }

        return upcomingSchedules;
    },

    populateTaskExecutionCounts: function(taskExecutionGr) {
        var summaryString = taskExecutionGr.getValue(this.POLICY_EXECUTION.EXECUTION_SUMMARY);
        if (gs.nil(summaryString)) {
            gs.warn('Data Manager: no content in execution summary');
            return;
        }
        var clauses = summaryString.split(';');
        if (clauses.length === 2) {
            var taskCount = clauses[0].split(':')[1].trim();
            var recordCount = clauses[1].split(':')[1].trim();
            taskExecutionGr.setValue(this.POLICY_EXECUTION.OPEN_TASK_COUNT, taskCount);
            taskExecutionGr.setValue(this.POLICY_EXECUTION.RECORD_COUNT, recordCount);
        } else {
            gs.warn('Data Manager: Unable to populate task and record counts, unexpected contents in execution summary');
        }
    },

    calculatePolicyExecutionPercentage: function(policyExecutionId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CALCULATE_POLICY_EXECUTION_PERCENTAGE, this._calculatePolicyExecutionPercentage, policyExecutionId);
    },

    _calculatePolicyExecutionPercentage: function(policyExecutionId) {
        CMDBWsDMUtil.validateRequiredParam(
            policyExecutionId, {
                action: this.ACTIONS.DM_CALCULATE_POLICY_EXECUTION_PERCENTAGE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy execution ID is required"),
                details: "Policy execution ID is required when calculating completion percentage",
            }
        );
        var executionIdFilter = this.TASK.POLICY_EXECUTION_ID + "=" + policyExecutionId;
        var totalTasks = CMDBWsDMUtil.getRowCount(this.TASK.TABLE, executionIdFilter);

        var nonClosedTasks = CMDBWsDMUtil.getRowCount(this.TASK.TABLE, executionIdFilter + "^" + this.TASK_FILTERS.IS_NOT_CLOSED);

        if (totalTasks == 0) {
            totalTasks = nonClosedTasks;
        }

        var grExec = new GlideRecord(this.POLICY_EXECUTION.TABLE);
        if (totalTasks > 0 && grExec.get(policyExecutionId)) {
            grExec.setValue(this.POLICY_EXECUTION.PERCENT_COMPLETE, (1 - (nonClosedTasks / totalTasks)) * 100);
            grExec.update();
        }
    },

    setDefaultTableValue: function(policyGr) {
        var policyType = policyGr.getValue(this.POLICY.TYPE);
        if (policyType === this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id) {
            policyGr.setValue(this.POLICY.TABLE_COL, this.DEFAULT_RELATED_ENTRY_TABLE);
        } else {
            policyGr.setValue(this.POLICY.TABLE_COL, this.DEFAULT_POLICY_TABLE);
        }
        policyGr.update();
    },

    getCertSchedulesCounts: function() {
        var result = {};
        if (!gs.tableExists(this.CERT_SCHEDULE.TABLE))
            return result;

        // Cert schedules that have empty migration status and not in completed / imported state are considered as not migrated.
        var notMigratedCount = CMDBWsDMUtil.getRowCount(this.CERT_SCHEDULE.TABLE, this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.ISEMPTY + this.QUERY_FILTERS.OR + this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.NOT_IN + [this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.COMPLETED, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.IMPORTED], false);
        var inProgressCount = CMDBWsDMUtil.getRowCount(this.CERT_SCHEDULE.TABLE, this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.EQUAL + this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.IN_PROGRESS, false);
        var completedCount = CMDBWsDMUtil.getRowCount(this.CERT_SCHEDULE.TABLE, this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.EQUAL + this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.COMPLETED, false);
        var failedCount = CMDBWsDMUtil.getRowCount(this.CERT_SCHEDULE.TABLE, this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.EQUAL + this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.FAILED, false);
        var skippedACLCount = CMDBWsDMUtil.getRowCount(this.CERT_SCHEDULE.TABLE, this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.EQUAL + this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.SKIPPED_SECUIRTY_CONSTRAINTS, false);

        result.certSchsNotMigratedCount = parseInt(notMigratedCount);
        result[this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.IN_PROGRESS] = parseInt(inProgressCount);
        result[this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.COMPLETED] = parseInt(completedCount);
        result[this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.FAILED] = parseInt(failedCount);
        result[this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.SKIPPED_SECUIRTY_CONSTRAINTS] = parseInt(skippedACLCount);

        var progressUtil = new sn_cmdb_ws.CMDBWsProgressMonitorUtil();
        result.progressInfo = progressUtil.getProgressInfo(this.EVENTS.MIGRATE_CERT_SCHEDULES);

        return result;
    },

    migrateLegacyDataCertSchedules: function(progressId) {
        this.updateCertSchedulesMigStatus();

        var progressCount = 0;

        var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
        var progressUtil = new sn_cmdb_ws.CMDBWsProgressMonitorUtil();
        var progressGr = progressUtil.getProgressById(progressId);

        var grCertSchedule = new GlideRecordSecure(this.CERT_SCHEDULE.TABLE);
        grCertSchedule.addQuery(this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.EQUAL + this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.IN_PROGRESS);
        grCertSchedule.query();
        var totalCount = grCertSchedule.getRowCount();
        while (grCertSchedule.next()) {
            try
            {
                var exceptionMsg = "";
                var tableToCertify = grCertSchedule.getValue(this.CERT_SCHEDULE.TABLE_COL);
                if (!util.userCanReadTable(tableToCertify)) {
                    exceptionMsg = "User doesn't have read access to associated table";
                    this.updateCertSchedule(grCertSchedule, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.SKIPPED_SECUIRTY_CONSTRAINTS, exceptionMsg);
                    progressCount++;
                    progressUtil.updateProgress(progressGr, progressCount, totalCount);
                    continue;
                }

                var filterCondition = "";
                var certFilter = grCertSchedule.getValue(this.CERT_SCHEDULE.FILTER);
                if (certFilter) {
                    var grFilter = new GlideRecord(this.CERT_FILTER.TABLE);
                    grFilter.get(certFilter);

                    filterCondition = grFilter.getDisplayValue(this.CERT_FILTER.FILTER_CONDITION);
                }

                var taskAssignmentType = "";
                var taskManagementGroup = "";
                var taskManagementUser = "";
                var taskManagementFieldPath = "";
                var assignmentType = grCertSchedule.getValue(this.CERT_SCHEDULE.ASSIGNMENT_TYPE);
                var grSysDictionary = new GlideRecord(this.SYS_DICTIONARY.TABLE);
                grSysDictionary.addQuery(this.SYS_DICTIONARY.NAME, grCertSchedule.getValue(this.CERT_SCHEDULE.TABLE_COL));

                if (assignmentType == this.CERT_SCHEDULE.ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_USER) {
                    taskAssignmentType = this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_USER;
                } else if (assignmentType == this.CERT_SCHEDULE.ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_GROUP) {
                    taskAssignmentType = this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_GROUP;
                } else if (assignmentType == this.CERT_SCHEDULE.ASSIGNMENT_TYPE_OPTIONS.USER_FIELD) {
                    taskAssignmentType = this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.USER_FIELD;
                    if (util.isValidField(this.POLICY.TABLE, this.POLICY.TASK_MANAGEMENT_FIELD_PATH)) {
                        taskManagementFieldPath = grCertSchedule.getValue(this.CERT_SCHEDULE.ASSIGN_TO);
                    } else {
                        grSysDictionary.addQuery(this.SYS_DICTIONARY.ELEMENT, grCertSchedule.getValue(this.CERT_SCHEDULE.ASSIGN_TO));
                        grSysDictionary.query();
                        if (grSysDictionary.next()) {
                            taskManagementUser = grSysDictionary.getValue(this.SYS_ID);
                        }
                    }
                } else {
                    taskAssignmentType = this.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD;
                    if (util.isValidField(this.POLICY.TABLE, this.POLICY.TASK_MANAGEMENT_FIELD_PATH)) {
                        taskManagementFieldPath = grCertSchedule.getValue(this.CERT_SCHEDULE.ASSIGN_TO_GROUP);
                    } else {
                        grSysDictionary.addQuery(this.SYS_DICTIONARY.ELEMENT, grCertSchedule.getValue(this.CERT_SCHEDULE.ASSIGN_TO_GROUP));
                        grSysDictionary.query();
                        if (grSysDictionary.next()) {
                            taskManagementGroup = grSysDictionary.getValue(this.SYS_ID);
                        }
                    }
                }

                var grDMCertPolicy = '';
                if (gs.getUserID() == this.ROLE.SYSTEM && !gs.hasRole(this.ROLE.SCRIPT_WRITER_PERMISSION)) {
                    grDMCertPolicy = new GlideRecord(this.CERTIFICATION_POLICY.TABLE);
                } else {
                    grDMCertPolicy = new GlideRecordSecure(this.CERTIFICATION_POLICY.TABLE);
                }
                grDMCertPolicy.initialize();
                grDMCertPolicy.setValue(this.POLICY.NAME, grCertSchedule.getValue(this.CERT_SCHEDULE.NAME));
                grDMCertPolicy.setValue(this.POLICY.TYPE, this.OOB_POLICY_TYPES.CERTIFICATION.sys_id);
                grDMCertPolicy.setValue(this.POLICY.NEEDS_REVIEW, false);
                grDMCertPolicy.setValue(this.POLICY.DESCRIPTION, grCertSchedule.getValue(this.CERT_SCHEDULE.TASK_DESCRIPTION));
                grDMCertPolicy.setValue(this.POLICY.TABLE_COL, grCertSchedule.getValue(this.CERT_SCHEDULE.TABLE_COL));
                grDMCertPolicy.setValue(this.POLICY.ENCODED_QUERY, filterCondition);
                grDMCertPolicy.setValue(this.POLICY.TASK_DUE_IN_DAYS, grCertSchedule.getValue(this.CERT_SCHEDULE.DAYS_TO_COMPLETE));
                grDMCertPolicy.setValue(this.CERTIFICATION_POLICY.DISPLAY_FIELDS, grCertSchedule.getValue(this.CERT_SCHEDULE.DISPLAY_FIELDS));
                grDMCertPolicy.setValue(this.CERTIFICATION_POLICY.CERTIFICATION_FIELDS, grCertSchedule.getValue(this.CERT_SCHEDULE.FIELDS));
                grDMCertPolicy.setValue(this.CERTIFICATION_POLICY.INSTRUCTIONS, grCertSchedule.getValue(this.CERT_SCHEDULE.INSTRUCTIONS));
                grDMCertPolicy.setValue(this.POLICY.TASK_ASSIGNMENT_TYPE, taskAssignmentType);
                grDMCertPolicy.setValue(this.POLICY.USER_GROUP, grCertSchedule.getValue(this.CERT_SCHEDULE.GROUP));
                grDMCertPolicy.setValue(this.POLICY.USER, grCertSchedule.getValue(this.CERT_SCHEDULE.USER));
                grDMCertPolicy.setValue(this.POLICY.TASK_MANAGEMENT_USER, taskManagementUser);
                grDMCertPolicy.setValue(this.POLICY.TASK_MANAGEMENT_GROUP, taskManagementGroup);
                if (util.isValidField(this.POLICY.TABLE, this.POLICY.TASK_MANAGEMENT_FIELD_PATH)) {
                    grDMCertPolicy.setValue(this.POLICY.TASK_MANAGEMENT_FIELD_PATH, taskManagementFieldPath);
                }
                

                try {
                    var sysId = '';
                    if (grDMCertPolicy.canCreate()) {
                        sysId = grDMCertPolicy.insert();
                    }
                    if (gs.nil(sysId)) {
                        var lastError = grDMCertPolicy.getLastErrorMessage();
                        throw new Error(lastError);
                    }
                } catch (ex) {
                    //Just log the error. No need to throw it.
                    new CMDBWsError({
                        code: this.ERROR_CODES.DM_FAILED_INSERT,
                        message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy insert failed"),
                        action: this.ACTIONS.DM_CREATE_POLICY,
                        source: this.DM_ERROR_SOURCE,
                        details: "Server side unexpected error occurred when inserting policy. See syslog for more details.",
                        logError: true,
                        originalError: ex
                    });

                    exceptionMsg = "Policy insertion failed : " + ex;
                    this.updateCertSchedule(grCertSchedule, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.FAILED, exceptionMsg);
                    progressCount++;
                    progressUtil.updateProgress(progressGr, progressCount, totalCount);
                    continue;
                }

                var policyId = grDMCertPolicy.getUniqueValue();
                try {
                    this._createPolicyRuntimeAttribute(policyId);
                } catch (ex) {
                    this.deletePolicy(policyId);
                    exceptionMsg = "Policy runtime attribute insertion failed : " + (ex.ORIGINAL_ERROR ? ex.ORIGINAL_ERROR : ex);
                    this.updateCertSchedule(grCertSchedule, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.FAILED, exceptionMsg);
                    progressCount++;
                    progressUtil.updateProgress(progressGr, progressCount, totalCount);
                    continue;
                }

                var runType = grCertSchedule.getValue(this.POLICY_SCHEDULED_JOB.RUN_TYPE);
                var runTime = grCertSchedule.getValue(this.POLICY_SCHEDULED_JOB.RUN_TIME);
                var runStart = grCertSchedule.getValue(this.POLICY_SCHEDULED_JOB.RUN_START);

                var runPeriod = "";
                var certSchRunPeriod = grCertSchedule.getValue(this.POLICY_SCHEDULED_JOB.RUN_PERIOD);
                if (certSchRunPeriod) {
                    var startDT = new GlideDateTime("1970-01-01");
                    var endDT = new GlideDateTime(certSchRunPeriod);
                    runPeriod = GlideDateTime.subtract(startDT, endDT).getDayPart();
                }

                var runDayOfWeek = grCertSchedule.getValue(this.POLICY_SCHEDULED_JOB.RUN_DAYOFWEEK);
                var runDayOfMonth = grCertSchedule.getValue(this.POLICY_SCHEDULED_JOB.RUN_DAYOFMONTH);
                try {
                    this._policyJobAccessor.createPolicySchedule(policyId, runType, runTime, runStart, runPeriod, runDayOfWeek, runDayOfMonth);
                } catch (ex) {
                    this.deletePolicy(policyId);
                    exceptionMsg = "Policy scheduled job insertion failed : " + (ex.ORIGINAL_ERROR ? ex.ORIGINAL_ERROR : ex);
                    this.updateCertSchedule(grCertSchedule, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.FAILED, exceptionMsg);
                    progressCount++;
                    progressUtil.updateProgress(progressGr, progressCount, totalCount);
                    continue;
                }

                this.updateCertSchedule(grCertSchedule, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.COMPLETED);
                progressCount++;
                progressUtil.updateProgress(progressGr, progressCount, totalCount);
            } catch (ex) {
                exceptionMsg = "Exception occurred during import : " + (ex.ORIGINAL_ERROR ? ex.ORIGINAL_ERROR : ex);
                this.updateCertSchedule(grCertSchedule, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.FAILED, exceptionMsg);
                progressCount++;
                progressUtil.updateProgress(progressGr, progressCount, totalCount);
                continue;
            }
        }
    },

    updateCertSchedule: function (grCertSchedule, status, exceptionMsg) {
        grCertSchedule.setValue(this.CERT_SCHEDULE.MIGRATION_STATUS, status);
        if (exceptionMsg) {
            grCertSchedule.setValue(this.CERT_SCHEDULE.MIGRATION_EXCEPTION, exceptionMsg);
        }
        if (status == this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.COMPLETED) {
            grCertSchedule.setValue(this.CERT_SCHEDULE.ACTIVE, false);
            grCertSchedule.setValue(this.CERT_SCHEDULE.MIGRATION_EXCEPTION, "");
        }
        grCertSchedule.update();
    },

    updateCertSchedulesMigStatus: function () {
        // Update the status from "Completed" to "Imported" for the schedules that are already imported
        var grCertSchedule = new GlideRecordSecure(this.CERT_SCHEDULE.TABLE);
        grCertSchedule.addQuery(this.CERT_SCHEDULE.MIGRATION_STATUS, this.QUERY_FILTERS.EQUAL, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.COMPLETED);
        grCertSchedule.query();
        grCertSchedule.setValue(this.CERT_SCHEDULE.MIGRATION_STATUS, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.IMPORTED);
        grCertSchedule.updateMultiple();

        // Update all the certification schedules that are about to migrate to "In progress" state
        grCertSchedule = new GlideRecordSecure(this.CERT_SCHEDULE.TABLE);
        grCertSchedule.addQuery(this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.ISEMPTY + this.QUERY_FILTERS.OR + this.CERT_SCHEDULE.MIGRATION_STATUS + this.QUERY_FILTERS.NOT_IN + [this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.COMPLETED, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.IMPORTED]);
        grCertSchedule.query();
        grCertSchedule.setValue(this.CERT_SCHEDULE.MIGRATION_STATUS, this.CERT_SCHEDULE.MIGRATION_STATUS_OPTIONS.IN_PROGRESS);
        grCertSchedule.updateMultiple();
    },

	searchDataFilterTableOptions: function(searchTerm, policyType, currentValue) {
		return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_DATA_FILTER, this._searchDataFilterTableOptions, searchTerm, policyType, currentValue);
	},

	_searchDataFilterTableOptions: function(searchTerm, policyType, currentValue) {
		var tableOptions = [{'id': -1, 'label': sn_i18n.Message.getMessage("sn_cmdb_ws", "Search for a policy table (3 characters minimum)")}];
		var appendCurrentTable = true;
		var currentItem = null;
		if (!gs.nil(currentValue)) {
			var tableLabel = new GlideRecord(currentValue).getLabel();
			currentItem = {
				id: currentValue,
				label: tableLabel,
				sublabel: currentValue
			};
		}
		if (global.JSUtil.nil(searchTerm)) {
			if (!gs.nil(currentItem))
				tableOptions.push(currentItem);
			return tableOptions;
		}
		if (policyType === this.OOB_POLICY_TYPES.DELETE_CMDB_RELATED_ENTRY.sys_id) {
			var gr = new GlideRecord(this.CMDB_RELATED_ENTRY.TABLE);
			gr.addQuery('active', true);
			gr.addEncodedQuery(this.CMDB_RELATED_ENTRY.TABLE_COL + 'STARTSWITH' + searchTerm);
			gr.setLimit(this.UI_DEFAULT_LIMIT.DATA_FILTER_TABLE_SEARCH_RESULTS_LIMIT);
			gr.query();
			var relatedEntryTables = [];
			var processedTableNameMap = {};
			var tableName = '';
			while (gr.next()) {
				try {
					tableName = gr.getValue(this.CMDB_RELATED_ENTRY.TABLE_COL);
					if (processedTableNameMap[tableName]) {
						continue;
					}
					processedTableNameMap[tableName] = true;
					var aclGr = new GlideRecord(tableName);
					if (aclGr.isValid() && aclGr.canRead()) {
						relatedEntryTables.push({
							'id': tableName,
							'label': aclGr.getClassDisplayValue(),
							'sublabel': tableName
						});
						if (tableName == currentValue)
							appendCurrentTable = false;
					}
				} catch(e) {
					continue;
				}
			}
			if (appendCurrentTable && !gs.nil(currentItem))
				relatedEntryTables.push(currentItem);
			relatedEntryTables.sort(function(left, right) {
				return (left.label === right.label ? 0 : (left.label > right.label ? 1 : -1));
			});
			tableOptions = tableOptions.concat(relatedEntryTables);
			return tableOptions;
		}
		var cmdbTables = [];
		if (policyType != this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
			cmdbTables = new GlideTableHierarchy('cmdb').getAllExtensions();	
		}
		var gr = new GlideRecord(this.SYS_DB_OBJECT.TABLE);
		gr.addEncodedQuery(this.SYS_DB_OBJECT.LABEL + 'STARTSWITH' + searchTerm + '^OR' + this.SYS_DB_OBJECT.NAME + 'STARTSWITH' + searchTerm);
		gr.orderBy(this.SYS_DB_OBJECT.NAME);
		gr.setLimit(this.UI_DEFAULT_LIMIT.DATA_FILTER_TABLE_SEARCH_RESULTS_LIMIT);
		gr.query();

		while (gr.next()) {
			try {
				var tableName = gr.getValue(this.SYS_DB_OBJECT.NAME);
				var tableLabel = gr.getValue(this.SYS_DB_OBJECT.LABEL);
				if (policyType != this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
					if (cmdbTables.indexOf(tableName) < 0) {
						continue;
					}
				}
				var tableGr = new GlideRecord(tableName);
				if (tableGr.isValid() && tableGr.canRead()) {
					tableOptions.push({
						"id": tableName,
						"label": tableLabel,
						"sublabel": tableName
					});
					if (tableName == currentValue)
						appendCurrentTable = false;
				}
			} catch(e) {
				continue;
			}
		}

		if (appendCurrentTable && !gs.nil(currentItem))
			tableOptions.push(currentItem);

		return tableOptions;
	},

    getCertificationPolicyViewName: function(certTable, displayFields, certificationFields) {
        var CERT_VIEW_PREFIX = 'cmdb_data_cert_';
        var digest = new GlideDigest();
        // Generate a sha1 hex based on the certification table and fields used to use as id at end of view name
        // signature should look like `table:{certTableName}|display:{displayFieldsList}|certification:{certificationFieldsList}`
        var signature = 'table:' + certTable + '|display:' + displayFields + '|certification:' + certificationFields;
        var viewId = digest.getSHA1Hex(signature).toLowerCase();
        var viewName = CERT_VIEW_PREFIX + viewId;
        var viewGr = new GlideRecord(this.SYS_UI_VIEW.TABLE);
        viewGr.addQuery(this.SYS_UI_VIEW.NAME, viewName);
        viewGr.setLimit(1);
        viewGr.query();
        // If view with calculated name does not already exist, queue it for creation
        if (!viewGr.hasNext()) {
            gs.eventQueue(this.EVENTS.CREATE_CERTIFICATION_VIEW, null, viewId, JSON.stringify({
                certTable: certTable,
                displayFields: displayFields.split(','),
                certificationFields: certificationFields.split(',')
            }));
        }

        return viewName;
    },

	getUserGroups: function(searchText) {
		var results = [];
		var userGroupGr = new GlideRecord(this.SYS_DICTIONARY.SYS_USER_GROUP);
		userGroupGr.addQuery(this.NAME, this.SEARCH_TYPES.STARTSWITH, searchText);
		userGroupGr.setLimit(this.UI_DEFAULT_LIMIT.REJECT_TASK_NOTIFICATION_GROUP_LIMIT);
		userGroupGr.query();
		while (userGroupGr.next()) {
			results.push({
				id: userGroupGr.getUniqueValue(),
				label: userGroupGr.getValue(this.NAME)
			});
		}
		return results;
	},

    type: 'CMDBWsDMPolicyManager'
});
