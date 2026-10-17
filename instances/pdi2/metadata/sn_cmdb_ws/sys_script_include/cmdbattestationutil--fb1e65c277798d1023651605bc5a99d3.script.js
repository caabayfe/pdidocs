var CMDBAttestationUtil = Class.create();
CMDBAttestationUtil.prototype = {
    initialize: function() {
        this.currentUserId = gs.getUserID();
        this.wsUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
        this.progressMonitorUtil = new sn_cmdb_ws.CMDBWsProgressMonitorUtil();

        this.ACTIONS_MAPPING = {
            attest: {
                key: 'attest',
                action: 'attested',
                attestation_status: 'Attested',
                attested_by: this.currentUserId
            },
            unattest: {
                key: 'unattest',
                action: 'unattested',
                attestation_status: 'Not Yet Reviewed',
                attested_by: ''
            },
            reject: {
                key: 'reject',
                action: 'rejected',
                attestation_status: 'Rejected',
                attested_by: this.currentUserId
            }
        };
    },

    SYS_PROPS_NAME: {
        ALLOW_CODE_TAG: 'glide.ui.security.allow_codetag',
        DISCOVERY_SRC_EXCLUSION: "sn_cmdb_ws.attestation.smart_detection.discovery_source.exclusion",
        DISCOVERY_WINDOW: "sn_cmdb_ws.attestation.smart_detection.discovery_window",
        DISABLE_SMART_DETECTION: "sn_cmdb_ws.attestation.smart_detection.disabled"
    },

    PLUGINS: {
        DISCOVERY_PLUGIN: "com.snc.discovery",
        INTEGRATION_COMMONS_PLUGIN: "com.snc.cmdb.integration_util"
    },

    ROLES: {
        DATA_MANAGER_ADMIN_ROLE: 'b156309e53722010af64ddeeff7b1227'
    },

    TABLES: {
        TASK_TO_CI_TABLE: 'sn_cmdb_ws_attestation_task_to_ci',
        DM_TASK_TABLE: 'cmdb_data_management_task',
        DEDUPE_TASK_TABLE: 'reconcile_duplicate_task',
        GROUP_MEMBER_TABLE: 'sys_user_grmember',
        POLICY_EXCLUSION_LIST_TABLE: 'cmdb_policy_ci_exclusion_list',
        SYS_USER_HAS_ROLE: 'sys_user_has_role',
        ATTESTATION_TASK_STATE: 'sn_cmdb_ws_attestation_task_state',
        CMDB_CI: 'cmdb_ci'
    },

    ROLE: {
        DATA_MANAGER_ADMIN: 'data_manager_admin'
    },

    SYS_USER_HAS_ROLE_FIELDS: {
        ROLE: 'role',
        USER: 'user',
    },

    GROUP_MEMBER_FIELDS: {
        GROUP: 'group',
        USER: 'user'
    },

    CI_FIELDS: {
        SYS_ID: 'sys_id',
        CLASS_NAME: 'sys_class_name',
        DISCOVERY_SOURCE: 'discovery_source',
        LAST_DISCOVERED: 'last_discovered'
    },

    ATTESTATION_FIELDS: {
        ATTESTATION_STATUS: 'attestation_status',
        ATTESTED_BY: 'attested_by',
        ATTESTED_DATE: 'attested_date'
    },

    TASK_FIELDS: {
        NUMBER: 'number',
        ASSIGNED_TO: 'assigned_to',
        ASSIGNMENT_GROUP: 'assignment_group',
        STATE: 'state',
        SUCCESS_PERCENT: 'success_percent'
    },

    TASK_STATE_FIELDS: {
        CMDB_TASK: "cmdb_data_management_task",
        SMART_DETECTION_ACCEPTED: "smart_detection_accepted",
        CI_COUNT: "smart_detection_ci_count",
        SMART_DETECTION_RUN_ON: "smart_detection_run_on",
        HIDE_POPUP_USER_PREF: "hide_popup_user_pref",
        ATTESTED_CIS: "attested_ci_count",
        REJECTED_CIS: "rejected_ci_count",
        DUPLICATE_CIS: "duplicate_ci_count",
        EXCLUDED_CIS: "excluded_ci_count",
    },

    TASK_TO_CI_FIELDS: {
        SYS_ID: 'sys_id',
        CMDB_TASK: 'cmdb_data_management_task',
        CI: 'ci',
        DISCOVERY_SOURCE: "ci.discovery_source",
        LAST_DISCOVERED: "ci.last_discovered",
        ATTESTATION_STATUS: "ci.attestation_status"
    },

    EXCLUSION_LIST_FIELDS: {
        CI: 'ci',
        POLICY_TYPE: 'policy_type'
    },

    _ERROR_MESSAGES: {
        UNAUTHORIZED: {
            error: {
                code: 'UNAUTHORIZED',
                message: 'This task is not assigned to you.'
            }
        },
        INVALID_ACTION: {
            error: {
                code: 'INVALID_ACTION',
                message: 'Invalid attestation action'
            }
        },
        INVALID_INPUT: {
            error: {
                code: 'INVALID_INPUT',
                message: 'At least one CI sysId required.'
            }
        },
        DUPLICATE_MINIMUM: {
            error: {
                code: 'DUPLICATE_NEEDS_TWO_MINIMUM',
                message: 'Cannot create a duplicate task with just 1 CI. Must select at least 2.'
            }
        },
        MULTIPLE_IRE_RULES: {
            error: {
                code: 'MULTIPLE_IRE_RULES',
                message: 'Cannot create a duplicate task for CIs with multiple IRE rules.'
            }
        },
        DUPLICATE_TASK_FAILED: {
            error: {
                code: 'DUPLICATE_TASK_FAILED',
                message: 'Failed to create De-duplication Task.'
            }
        }
    },

    NOTIFICATION_EVENTS: {
        ATTESTATION_ACTION_ASYNC: 'sn_cmdb_ws.attestationtask.action',
        TASK_SEND_TO_ADMIN: 'sn_cmdb_ws.attestationtask.sendtoadmin',
        TASK_REASSIGN: 'sn_cmdb_ws.attestationtask.reassign',
        TASK_COMPLETED: 'sn_cmdb_ws.attestationtask.completed'
    },

    ATTESTATION_STATUS: {
        ATTESTED: 'Attested',
        REJECTED: 'Rejected',
        NOT_YET_REVIEWED: 'Not Yet Reviewed'
    },

    QUERY_FILTERS: {
        IN: "IN",
        NOT_IN: "NOT IN",
        NOT_EQUAL: "!=",
        GTE: ">="
    },

    TASK_STATE: {
        OPEN: "1",
        WORK_IN_PROGRESS: "2",
        CLOSED_COMPLETE: "3"
    },

    UI_DEFAULT_LIMIT: {
        ATTEST_RECORDS: 100
    },

    EVENTS: {
        UPDATE_ATTESTATION_TASK_PERCENT_COMPLETE: 'sn_cmdb_ws.attestationtask.perc.update',
        UPDATE_EXISTING_ATTESTATION_TASK_PERCENT_COMPLETE: 'sn_cmdb_ws.attesttask.exist.perc.update',
    },

    // if task is active get the count by grouping attestation_status field but if it's closed get it from task state table
    getCisSummaryCount: function(taskSysId) {
        var taskGr = new GlideRecord(this.TABLES.DM_TASK_TABLE);
        if (taskGr.get(taskSysId)) {
            var isTaskClosed = taskGr.getValue(this.TASK_FIELDS.STATE) === this.TASK_STATE.CLOSED_COMPLETE;
            var taskCIsSummaryFields = [];
            var totalCICount = 0;
            var attestedCICount = 0;
            var rejectedCICount = 0;
            var notYetReviewedCICount = 0;
            if (isTaskClosed) {
                var taskState = this.getTaskState(taskSysId);
                totalCICount = taskState.attestedCis + taskState.rejectedCis;
                attestedCICount = taskState.attestedCis;
                rejectedCICount = taskState.rejectedCis;
            } else {
                var taskStatus = this.getCountBasedOnAttestationStatus(taskSysId);
                for (var i = 0; i < taskStatus.length; i++) {
                    totalCICount += taskStatus[i].count;
                    if (taskStatus[i].attestation_status === this.ATTESTATION_STATUS.ATTESTED) {
                        attestedCICount = taskStatus[i].count;
                    } else if (taskStatus[i].attestation_status === this.ATTESTATION_STATUS.REJECTED) {
                        rejectedCICount = taskStatus[i].count;
                    } else if (taskStatus[i].attestation_status === this.ATTESTATION_STATUS.NOT_YET_REVIEWED) {
                        notYetReviewedCICount = taskStatus[i].count;
                    }
                }
            }

            var percentCompleteStr = taskGr.getValue(this.TASK_FIELDS.SUCCESS_PERCENT);
            percentCompleteStr += "%";

            taskCIsSummaryFields.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Total to attest"),
                displayValue: totalCICount
            });

            taskCIsSummaryFields.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Attested CIs"),
                displayValue: attestedCICount
            });

            taskCIsSummaryFields.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Rejected CIs"),
                displayValue: rejectedCICount
            });

            taskCIsSummaryFields.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Percent complete"),
                displayValue: percentCompleteStr
            });
            return taskCIsSummaryFields;
        }
    },

    getCountBasedOnAttestationStatus: function(taskSysId) {
        var result = [];
        var ga = new GlideAggregate('sn_cmdb_ws_attestation_task_to_ci');
        ga.addEncodedQuery("cmdb_data_management_task=" + taskSysId, true);
        ga.addAggregate("COUNT");
        ga.groupBy("ci.attestation_status");
        ga.query();

        while (ga.next()) {
            var status = ga.getValue("ci.attestation_status");
            var count = parseInt(ga.getAggregate('COUNT'));

            var obj = {
                'attestation_status': status,
                'count': count
            };
            result.push(obj);
        }
        return result;
    },

    buildTaskToCiGr: function(taskId, sysIds, allRecordsSelected, currentAttestationStatus, excludedSysIds, query) {
        var gr = new GlideRecord(this.TABLES.TASK_TO_CI_TABLE);
        if (allRecordsSelected) {
            gr.addQuery(this.TASK_TO_CI_FIELDS.CMDB_TASK, taskId);
            gr.addQuery(this.TASK_TO_CI_FIELDS.ATTESTATION_STATUS, currentAttestationStatus);
            if (excludedSysIds) {
                gr.addQuery(this.TASK_TO_CI_FIELDS.SYS_ID, this.QUERY_FILTERS.NOT_IN, excludedSysIds);
            }
            if (global.JSUtil.notNil(query)) {
                gr.addEncodedQuery(query);
            }
        } else {
            gr.addQuery(this.TASK_TO_CI_FIELDS.SYS_ID, this.QUERY_FILTERS.IN, sysIds);
        }
        return gr;
    },

    removeDuplicates: function(taskId, sysIds, action, userComment, allRecordsSelected, currentAttestationStatus, excludedSysIds, query) {
        if (!allRecordsSelected) {
            var inputSysIdArr = sysIds.split(",");
            if (inputSysIdArr.length < 2) {
                return this._ERROR_MESSAGES.DUPLICATE_MINIMUM;
            }
        }

        var taskGr;
        var ciSysIds = [];
        var ciDisplayNames = [];
        var ciClassNames = {};

        //first get all the ciSysIds and ciDisplayNameList from the given sysIds
        var gr = this.buildTaskToCiGr(taskId, sysIds, allRecordsSelected, currentAttestationStatus, excludedSysIds, query);
        gr.query();
        while (gr.next()) {
            if (!taskGr) {
                taskGr = gr.cmdb_data_management_task.getRefRecord();
            }
            var ciGr = gr.ci.getRefRecord();
            ciSysIds.push(ciGr.getUniqueValue());
            ciDisplayNames.push(ciGr.getDisplayValue());
            var currentClassName = ciGr.getValue(this.CI_FIELDS.CLASS_NAME);
            if (!ciClassNames[currentClassName]) {
                ciClassNames[currentClassName] = 1;
            }
        }

        //pre-validation check
        var dupTaskUtil = new global.CMDBDuplicateTaskUtils();
        if (Object.keys(ciClassNames).length > 1) {
            //ire rule check only needs to be run when there's more than 1 sys_class_name in the selected CIs
            var ireRuleSet = {};
            for (className in ciClassNames) {
                var ireRuleObj = JSON.parse(dupTaskUtil.getIdentificationRules(className));
                var currentIreTable = null;
                if (ireRuleObj.table) {
                    currentIreTable = ireRuleObj.table;
                }

                if (!ireRuleSet[currentIreTable]) {
                    ireRuleSet[currentIreTable] = 1;
                }
                var ireRuleTableLength = Object.keys(ireRuleSet).length;
                if (ireRuleTableLength > 1) {
                    return this._ERROR_MESSAGES.MULTIPLE_IRE_RULES; //if there are more than 1 ireRule table in the set, short circuit out
                }

            }
        }


        //pre-validation check passes. Let's get on creating that de-dupe task
        var ciSysIdsJoined = ciSysIds.join(',');
        var deDupeTask = dupTaskUtil.createDuplicateTask(ciSysIdsJoined);
        if (deDupeTask && taskGr) {
            //remove these sysIds from task_to_ci table
            gr = new GlideRecord(this.TABLES.TASK_TO_CI_TABLE);
            gr.addQuery('ci', 'IN', ciSysIdsJoined);
            gr.addQuery(this.TABLES.DM_TASK_TABLE, taskGr.getUniqueValue());
            gr.deleteMultiple();

            // update taskGr with work_notes
            var dupeGr = new GlideRecord(this.TABLES.DEDUPE_TASK_TABLE);
            if (dupeGr.get(deDupeTask)) {
                var deDupeTaskNumber = dupeGr.getValue(this.TASK_FIELDS.NUMBER);
                var deDupeUrl = '/nav_to.do?uri=reconcile_duplicate_task.do?sysparm_query=sys_id=' + deDupeTask;
                var deDupeLink = deDupeTaskNumber;
                if (gs.getProperty(this.SYS_PROPS_NAME.ALLOW_CODE_TAG).toLowerCase() == "true") {
                    var hrefLink = "<a href='" + deDupeUrl + "'>" + deDupeTaskNumber + "</a>";
                    deDupeLink = '[code]' + hrefLink + '[/code]';
                }
                taskGr.comments = gs.getMessage("A De-duplication Task {0} has been successfully created.\nThe following CIs were removed from attestation: \n{1}", [deDupeLink, ciDisplayNames.join(", ")]);
                taskGr.update();

                // update the current count
                var prevDuplicateCis = this.getTaskState(taskId).duplicateCis;
                var totalDuplicateCis = prevDuplicateCis + ciSysIds.length;

                this.insertOrUpdateTaskStateField(taskId, this.TASK_STATE_FIELDS.DUPLICATE_CIS, totalDuplicateCis);
				this.queueUpdateAttestationTaskPercentCompleteEvent(taskId);

                //return success
                return {
                    action: 'duplicate',
                    successCount: ciDisplayNames.length,
                    deDupeTaskNumber: deDupeTaskNumber,
                    deDupeUrl: deDupeUrl
                };
            }

        } else {
            return this._ERROR_MESSAGES.DUPLICATE_TASK_FAILED;
        }
    },

    performAttestationAction: function(taskId, sysIds, action, userComment, allRecordsSelected, currentAttestationStatus, excludedSysIds, progressId, query) {
        var attestationFieldsValue = this.ACTIONS_MAPPING[action];
        if (!attestationFieldsValue) {
            return this._ERROR_MESSAGES.INVALID_ACTION;
        }

        //var currentUserId = gs.getUserID();
        var successfulCiNames = [];
        var failureCount = 0;
        var taskGr;
        var gr = this.buildTaskToCiGr(taskId, sysIds, allRecordsSelected, currentAttestationStatus, excludedSysIds, query);
        var progressGr;
        var processedRecords = 0;
        var totalRecords;

        gr.query();
        if (progressId) {
            totalRecords = gr.getRowCount();
            progressGr = this.progressMonitorUtil.getProgressById(progressId);
            if (progressGr) {
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }
        while (gr.next()) {
            if (!taskGr) {
                taskGr = gr.cmdb_data_management_task.getRefRecord();
            }
            var ciGr = gr.ci.getRefRecord();
            ciGr.setValue(this.ATTESTATION_FIELDS.ATTESTATION_STATUS, attestationFieldsValue[this.ATTESTATION_FIELDS.ATTESTATION_STATUS]);
            ciGr.setValue(this.ATTESTATION_FIELDS.ATTESTED_BY, attestationFieldsValue[this.ATTESTATION_FIELDS.ATTESTED_BY]);
            ciGr.setValue(this.ATTESTATION_FIELDS.ATTESTED_DATE, new GlideDateTime());
            if (ciGr.update()) {
                successfulCiNames.push(ciGr.getDisplayValue());
            } else {
                failureCount++;
                gs.error("Unable to update attestation status for CI with sys_id: " + ciGr.getValue(this.CI_FIELDS.SYS_ID));
            }
            if (progressGr) {
                processedRecords++;
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }

        if (taskGr) {
            var reasonCommentText = "";
            if (userComment) {
                reasonCommentText = gs.getMessage("CIs were {0} for the following reason: {1}\n", [attestationFieldsValue.action, userComment]);
            }
            var impactedCiCommentText = gs.getMessage("The following CIs were {0}: \n{1}", [attestationFieldsValue.action, successfulCiNames.join(", ")]);
            taskGr.comments = gs.getMessage("{0} {1}", [reasonCommentText, impactedCiCommentText]);
            taskGr.update();
            this.updateAttestationCount(taskId);
			this.queueUpdateAttestationTaskPercentCompleteEvent(taskId);
        }

        return {
            action: attestationFieldsValue.key,
            successCount: successfulCiNames.length,
            failureCount: failureCount
        };

    },

    excludeCis: function(taskId, sysIds, action, userComment, allRecordsSelected, currentAttestationStatus, excludedSysIds, query) {
        var successfulCis = [];
        var successfulCiNames = [];
        var taskGr;
        var failureCount = 0;
        var gr = this.buildTaskToCiGr(taskId, sysIds, allRecordsSelected, currentAttestationStatus, excludedSysIds, query);
        gr.query();

        while (gr.next()) {
            if (!taskGr) {
                taskGr = gr.cmdb_data_management_task.getRefRecord();
            }
            //Insert into exclusion List
            var taskRefRec = taskGr.policy_id.getRefRecord();
            var grExclList = new GlideRecord(this.TABLES.POLICY_EXCLUSION_LIST_TABLE);
            grExclList.initialize();
            grExclList.setValue(this.EXCLUSION_LIST_FIELDS.CI, gr.ci);
            grExclList.setValue(this.EXCLUSION_LIST_FIELDS.POLICY_TYPE, taskRefRec.getValue('cmdb_policy_type'));
            var ciGr = gr.ci.getRefRecord();
            if (grExclList.insert()) {
                successfulCiNames.push(ciGr.getDisplayValue());
                successfulCis.push(gr.getValue(this.CI_FIELDS.SYS_ID));
            } else {
                failureCount++;
                gs.error("Unable to exclude CI with sys_id: " + gr.ci);
            }

        }

        //Deleting all excluded CIs
        var taskToCIgr = new GlideRecord(this.TABLES.TASK_TO_CI_TABLE);
        taskToCIgr.addQuery(this.CI_FIELDS.SYS_ID, 'IN', successfulCis.join());
        taskToCIgr.deleteMultiple();

        if (taskGr) {
            var reasonCommentText = "";
            if (userComment)
                reasonCommentText = gs.getMessage("CIs were excluded for the following reason: {0}\n", userComment);
            var impactedCiCommentText = gs.getMessage("The following CIs were excluded from attestation: \n{0}", successfulCiNames.join(", "));
            taskGr.comments = gs.getMessage("{0} {1}", [reasonCommentText, impactedCiCommentText]);
            taskGr.update();

            var prevExcludedCis = this.getTaskState(taskId).excludedCis;
            var totalExcludedCis = prevExcludedCis + successfulCis.length;
            this.insertOrUpdateTaskStateField(taskId, this.TASK_STATE_FIELDS.EXCLUDED_CIS, totalExcludedCis);
            this.updateAttestationCount(taskId);
			this.queueUpdateAttestationTaskPercentCompleteEvent(taskId);
        }

        return {
            action: 'exclude',
            successCount: successfulCis.length,
            failureCount: failureCount
        };
    },

    isTaskAssignedToCurrentUser: function(taskId) {
        var taskGr = new GlideRecord(this.TABLES.DM_TASK_TABLE);
        if (taskGr.get(taskId)) {
            var taskAssignedTo = taskGr.getValue(this.TASK_FIELDS.ASSIGNED_TO);
            if (taskAssignedTo === this.currentUserId) {
                return true;
            }
        }
        return false;
    },

    getUsersWithDataManagerAdminRole: function() {
        var usersList = [];
        var grUserRoles = new GlideRecord(this.TABLES.SYS_USER_HAS_ROLE);
        grUserRoles.addQuery(this.SYS_USER_HAS_ROLE_FIELDS.ROLE, this.ROLES.DATA_MANAGER_ADMIN_ROLE);
        grUserRoles.query();
        while (grUserRoles.next()) {
            usersList.push(grUserRoles.getValue(this.SYS_USER_HAS_ROLE_FIELDS.USER));
        }
        return usersList;
    },

    insertOrUpdateTaskStateFields: function(taskId, fieldValues) {
        var taskStateGr = new GlideRecord(this.TABLES.ATTESTATION_TASK_STATE);
        taskStateGr.addQuery(this.TASK_STATE_FIELDS.CMDB_TASK, taskId);
        taskStateGr.query();
        var grNext = taskStateGr.next();
        taskStateGr.setValue(this.TASK_STATE_FIELDS.CMDB_TASK, taskId);
        var fields = fieldValues ? Object.keys(fieldValues) : [];
        for (var i = 0; i < fields.length; i++) {
            taskStateGr.setValue(fields[i], fieldValues[fields[i]]);
        }

        if (grNext) {
            return taskStateGr.update();
        } else {
            return taskStateGr.insert();
        }
    },

    insertOrUpdateTaskStateField: function(taskId, field, value) {
        var updatedFieldValue = {};
        updatedFieldValue[field] = value;
        this.insertOrUpdateTaskStateFields(taskId, updatedFieldValue);
    },

    getTaskState: function(taskId) {
        var result = {};
        var tsf = this.TASK_STATE_FIELDS;
        var taskStateGr = new GlideRecord(this.TABLES.ATTESTATION_TASK_STATE);
        taskStateGr.addQuery(tsf.CMDB_TASK, taskId);
        taskStateGr.query();
        if (taskStateGr.next()) {
            result.smartDetectionAccepted = taskStateGr.getDisplayValue(this.TASK_STATE_FIELDS.SMART_DETECTION_ACCEPTED) === 'true';
            result.ciCount = +taskStateGr.getValue(this.TASK_STATE_FIELDS.CI_COUNT);
            result.runOn = taskStateGr.getValue(this.TASK_STATE_FIELDS.SMART_DETECTION_RUN_ON);
            result.lastDiscovered = taskStateGr.getValue(this.TASK_STATE_FIELDS.LAST_DISCOVERED);
            result.hidePopupUserPref = taskStateGr.getDisplayValue(this.TASK_STATE_FIELDS.HIDE_POPUP_USER_PREF) === 'true';
            result.attestedCis = +taskStateGr.getValue(this.TASK_STATE_FIELDS.ATTESTED_CIS);
            result.rejectedCis = +taskStateGr.getValue(this.TASK_STATE_FIELDS.REJECTED_CIS);
            result.duplicateCis = +taskStateGr.getValue(this.TASK_STATE_FIELDS.DUPLICATE_CIS);
            result.excludedCis = +taskStateGr.getValue(this.TASK_STATE_FIELDS.EXCLUDED_CIS);
            return result;
        } else {
            // if task exists but task state doesn't exist, insert the task state
            var taskGr = new GlideRecord(this.TABLES.DM_TASK_TABLE);
            if (taskGr.get(taskId)) {
                this.insertOrUpdateTaskStateFields(taskId, {});
                result.smartDetectionAccepted = false;
                result.ciCount = 0;
                result.runOn = null;
                result.lastDiscovered = null;
                result.hidePopupUserPref = false;
                result.attestedCis = 0;
                result.rejectedCis = 0;
                result.duplicateCis = 0;
                result.excludedCis = 0;
            }
            return result;
        }
    },

    updateAttestationCount: function(taskId) {
        var fieldValues = {};
        var status = this.getCountBasedOnAttestationStatus(taskId);
        var attestedCnt = 0;
        var rejectedCnt = 0;
        for (var i = 0; i < status.length; i++) {
            if (status[i].attestation_status === this.ATTESTATION_STATUS.ATTESTED) {
                attestedCnt = status[i].count;
            }
            if (status[i].attestation_status === this.ATTESTATION_STATUS.REJECTED) {
                rejectedCnt = status[i].count;
            }
        }
        fieldValues[this.TASK_STATE_FIELDS.ATTESTED_CIS] = attestedCnt;
        fieldValues[this.TASK_STATE_FIELDS.REJECTED_CIS] = rejectedCnt;
        this.insertOrUpdateTaskStateFields(taskId, fieldValues);
        return this.getTaskState(taskId);
    },

    deleteTaskState: function(taskId) {
        var taskStateGr = new GlideRecord(this.TABLES.ATTESTATION_TASK_STATE);
        taskStateGr.addQuery(this.TASK_STATE_FIELDS.CMDB_TASK, taskId);
        taskStateGr.query();
        if (taskStateGr.next()) {
            taskStateGr.deleteRecord();
        }
    },

	resetAttestationStatus: function(ciSysId) {
		if (!ciSysId) {
			gs.error('Empty CI sys_id in attestation task to CI table');
			return;
		}
		var gr = new GlideRecord(this.TABLES.CMDB_CI);
		gr.addQuery(this.CI_FIELDS.SYS_ID, ciSysId);
		gr.query();
		if (gr.next()) {
			gr.setValue(this.ATTESTATION_FIELDS.ATTESTATION_STATUS, this.ATTESTATION_STATUS.NOT_YET_REVIEWED);
			gr.update();
		}
	},

	queueUpdateAttestationTaskPercentCompleteEvent: function(taskId) {
		gs.eventQueue(this.EVENTS.UPDATE_ATTESTATION_TASK_PERCENT_COMPLETE, null, taskId);
	},

	// if task is active get the count by grouping attestation_status field but if it's closed get it from task state table
	updateAttestastionTaskPercentComplete: function(taskSysId) {
		var taskGr = new GlideRecord(this.TABLES.DM_TASK_TABLE);
        if (taskGr.get(taskSysId)) {
            var isTaskClosed = taskGr.getValue(this.TASK_FIELDS.STATE) === this.TASK_STATE.CLOSED_COMPLETE;
            var totalCICount = 0;
            var notYetReviewedCICount = 0;
            if (isTaskClosed) {
                var taskState = this.getTaskState(taskSysId);
                totalCICount = taskState.attestedCis + taskState.rejectedCis;
            } else {
				var taskStatus = this.getCountBasedOnAttestationStatus(taskSysId);
                for (var i = 0; i < taskStatus.length; i++) {
                    totalCICount += taskStatus[i].count;
                    if (taskStatus[i].attestation_status === this.ATTESTATION_STATUS.NOT_YET_REVIEWED) {
                        notYetReviewedCICount = taskStatus[i].count;
                    }
                }
            }

            var percentComplete = 0;
            if (totalCICount > 0) {
				var successPercent = 100 * ((totalCICount - notYetReviewedCICount) / totalCICount);
				taskGr.setValue(this.TASK_FIELDS.SUCCESS_PERCENT, successPercent);
				taskGr.update();
            }
        }
    },

    queueUpdateExistingAttestastionTasksPercCompEvent: function(taskId) {
        gs.eventQueue(this.EVENTS.UPDATE_EXISTING_ATTESTATION_TASK_PERCENT_COMPLETE, null, null);
    },

    updateExistingAttestastionTasksPercCompEvent: function() {
        var grTask = new GlideRecord(this.TABLES.DM_TASK_TABLE);
        grTask.addEncodedQuery(this.wsUtil.COLS.POLICY_ID + "." + this.wsUtil.COLS.CMDB_POLICY_TYPE + "=" + this.wsUtil.DATAMANAGER_POLICIES.ATTESTATION.SYS_ID + "^" + this.wsUtil.COLS.STATE + "!=1^" + this.TASK_FIELDS.SUCCESS_PERCENT + "=0");
        grTask.query();
        while (grTask.next()) {
            var taskId = grTask.getValue(this.wsUtil.COLS.SYS_ID);
            this.updateAttestastionTaskPercentComplete(taskId);
        }
    },

    type: 'CMDBAttestationUtil'
};
