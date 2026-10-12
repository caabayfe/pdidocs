var CMDBWsDMTaskManager = Class.create();
CMDBWsDMTaskManager.prototype = Object.extendsObject(CMDBWsDMConstants, {
    initialize: function() {
        this._taskAccessor = new CMDBWsDMTaskAccessor();
        this.wsUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
        this.progressMonitorUtil = new sn_cmdb_ws.CMDBWsProgressMonitorUtil();
    },

    getPolicyTypeForTask: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_TASK_REASSIGN, this._getPolicyTypeForTask, taskId);
    },

    _getPolicyTypeForTask: function(taskId) {
        return this._taskAccessor.getPolicyTypeForTaskId(taskId);
    },

    getTaskToCiTable: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_TASK_TO_CI_TABLE, this._getTaskToCiTable, taskId);
    },

    _getTaskToCiTable: function(taskId) {
        return this._taskAccessor.getTaskToCiTableName(taskId);
    },

    /**
     * Cancel Task
     * @param {*} taskId
     * @param {*} comment
     * */
    cancelTask: function(taskId, comment) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_TASK_CANCEL, this._cancelTask, taskId, comment);
    },

    _cancelTask: function(taskId, comment) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: this.ACTIONS.DM_CANCEL_TASK,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required to cancel task"
        });
        if (!CMDBWsDMUtil.hasPermissionToModifyPolicy()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_USER_MISSING_ROLE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Unable to cancel task. User does not have data manager admin role"),
                action: this.ACTIONS.DM_CANCEL_TASK,
                source: this.DM_ERROR_SOURCE,
                details: "Unable to cancel task. User does not have data manager admin role",
                logError: true
            });
        }
        var taskGr = this._taskAccessor.getTaskById(taskId, true);
        var policyTypeId = taskGr.policy_id.cmdb_policy_type + '';
        taskGr.setValue(this.TASK.STATE, this.TASK.STATE_OPTIONS.CLOSED_CANCELLED);
        taskGr.setValue(this.TASK.SUCCESS_PERCENT, 100);
        if (!gs.nil(comment)) {
            taskGr.comments = comment;
        }
        taskGr.update();
        if (policyTypeId == this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
            var taskToDocumentGr = this._taskAccessor.getCertificationTaskToDocument(taskId, '');
            while (taskToDocumentGr.next()) {
                var attributeStatusObj = this._taskAccessor.getCertificationAttributeStatus(taskToDocumentGr);
                var attributes = Object.keys(attributeStatusObj);
                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];
                    var attributeStatus = attributeStatusObj[attribute];
                    attributeStatus.setStatus(this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CANCELLED);
                }
                taskToDocumentGr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.ATTRIBUTE_STATUS, JSON.stringify(attributeStatusObj));
                taskToDocumentGr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS, this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CANCELLED);
                taskToDocumentGr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CONTAINS_CERTIFIED_ATTRIBUTES, false);
                taskToDocumentGr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CONTAINS_FAILED_ATTRIBUTES, false);
                if (!gs.nil(comment)) {
                    taskToDocumentGr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT, comment);
                }
                taskToDocumentGr.update();
            }
        }
    },

    /**
     * Reject Task
     * @param {*} taskSysId
     * @param {*} reasonForRejection
     * */
    rejectTask: function(taskSysId, reasonForRejection) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_REJECT_TASK, this._rejectTask, taskSysId, reasonForRejection);
    },

    _rejectTask: function(taskSysId, reasonForRejection) {
        CMDBWsDMUtil.validateRequiredParam(taskSysId, {
            action: this.ACTIONS.DM_REJECT_TASK,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task SysId is required"),
            details: "Task SysId is required to reject task"
        });

        CMDBWsDMUtil.validateRequiredParam(reasonForRejection, {
            action: this.ACTIONS.DM_REJECT_TASK,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Reject reason is required to reject a task"),
            details: "Reject reason is required to reject a task"
        });

        // Conditional ACLs require that the task is assigned to the user making changes
        var currentUserId = gs.getUserID();
        var taskGr = this._taskAccessor.getTaskById(taskSysId, true);
        taskGr.setValue(this.TASK.ASSIGNED_TO, currentUserId);
        taskGr.update();

        taskGr = this._taskAccessor.getTaskById(taskSysId, true);
        var policyTypeId = taskGr.policy_id.cmdb_policy_type + '';
        var workNotes = gs.getMessage("Rejected by {0}. Reason rejected: {1}.", [gs.getUserName(), reasonForRejection]);

        taskGr.setValue(this.TASK.STATE, this.TASK.STATE_OPTIONS.CLOSED_CANCELLED);
        taskGr.setValue(this.TASK.APPROVAL, this.TASK_APPROVAL.STATE_OPTIONS.REJECTED);
        taskGr.work_notes = workNotes;
        var updated = taskGr.update();
        if (updated) {
            var userList = this._getUserListForRejectedTaskNotifications();
            gs.eventQueue(this.NOTIFICATION_EVENTS.TASK_REJECTED, taskGr, userList.toString(), workNotes.toString());
        }
    },

    _getUserListForRejectedTaskNotifications: function() {
        var userList = this._getUserListFromSystemProperties();
        if (gs.nil(userList) || userList.length === 0) {
            userList = this._getUsersWithDataManagerAdminRole();
        }
        return userList;
    },

    _getUserListFromSystemProperties: function() {
        var rejectTaskNotificationGroup = CMDBWsDMProperties.getRejectedTaskNotificationsGroupID();
        var usersList = [];
        var grGroup = new GlideRecord(this.SYS_USER_GROUP_MEMBER.TABLE);
        grGroup.addQuery(this.SYS_USER_GROUP_MEMBER.GROUP, rejectTaskNotificationGroup);
        grGroup.query();
        while (grGroup.next()) {
            usersList.push(grGroup.getValue(this.SYS_USER_GROUP_MEMBER.USER));
        }
        return usersList;
    },

    _getUsersWithDataManagerAdminRole: function() {
        var usersList = [];
        var grUserRoles = new GlideRecord(this.SYS_USER_HAS_ROLE.TABLE);
        grUserRoles.addQuery(this.SYS_USER_HAS_ROLE_FIELDS.ROLE, this.ROLES.DATA_MANAGER_ADMIN_ROLE_SYS_ID);
        grUserRoles.query();
        while (grUserRoles.next()) {
            usersList.push(grUserRoles.getValue(this.SYS_USER_HAS_ROLE_FIELDS.USER));
        }
        return usersList;
    },

    /**
     * Reassign Task to new user
     * @param {*} taskId
     * @param {*} userId
     * */
    reassignTask: function(taskId, assignmentGroupId, userId, comment) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_TASK_REASSIGN, this._reassignTask, taskId, assignmentGroupId, userId, comment);
    },

    _reassignTask: function(taskId, assignmentGroupId, userId, comment) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: this.ACTIONS.DM_TASK_REASSIGN,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required to reassign task"
        });

        var taskGr = this._taskAccessor.getTaskById(taskId, false);
        if (assignmentGroupId !== undefined && assignmentGroupId !== null) {
            taskGr.setValue(this.TASK.ASSIGNMENT_GROUP, assignmentGroupId);
        }
        if (userId !== undefined && userId !== null) {
            taskGr.setValue(this.TASK.ASSIGNED_TO, userId);
        }
        if (!gs.nil(comment)) {
            taskGr.comments = comment;
        }
        taskGr.update();
    },

    /**
     * Assign Task to current user
     * @param {*} taskId
     * */
    assignToCurrentUser: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_TASK_ASSIGN_TO_CURRENT_USER, this._assignToCurrentUser, taskId);
    },

    _assignToCurrentUser: function(taskId) {
        // TODO: assign task to current user
    },

    /**
     * Gets the summary of records associated with the task
     */
    getTaskRecordSummary: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_GET_TASK_RECORD_SUMMARY, this._getTaskRecordSummary, taskId);
    },

    _getTaskRecordSummary: function(taskId) {
        var policyTypeInfo = this._getPolicyTypeForTask(taskId);
        var result = [];
        var totalRecords = 0;

        if (policyTypeInfo.sys_id == this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
            var summaryCount = this._taskAccessor.getCertificationRecordSummary(taskId);
            var statusKeys = Object.keys(summaryCount);
            for (var i = 0; i < statusKeys.length; i++) {
                totalRecords += summaryCount[statusKeys[i]];
            }

            var percentComplete = 0;
            var pendingRecords = summaryCount[this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.PENDING] || 0;
            if (totalRecords > 0) {
                percentComplete = parseFloat(((totalRecords - pendingRecords) / totalRecords) * 100);
            }
            var percentCompleteStr = percentComplete.toString();
            percentCompleteStr = this.wsUtil.getDecimalNumberWithGivenScale(percentCompleteStr, 1);
            percentCompleteStr = String(percentCompleteStr + "%");

            result.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Total to certify"),
                displayValue: totalRecords || 0
            });

            result.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Certified records"),
                displayValue: summaryCount[this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED] || 0
            });

            result.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Failed records"),
                displayValue: summaryCount[this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED] || 0
            });

            result.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Percent complete"),
                displayValue: percentCompleteStr
            });
        } else if (policyTypeInfo.sys_id == this.OOB_POLICY_TYPES.RETIRE.sys_id) {
            totalRecords = this._taskAccessor.getTotalTaskToRecordCount(taskId);
            result.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Total records to retire"),
                displayValue: totalRecords
            });
        } else if (policyTypeInfo.sys_id == this.OOB_POLICY_TYPES.ARCHIVE.sys_id) {
            totalRecords = this._taskAccessor.getTotalTaskToRecordCount(taskId);
            result.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Total records to archive"),
                displayValue: totalRecords
            });
        } else if (policyTypeInfo.sys_id == this.OOB_POLICY_TYPES.DELETE.sys_id) {
            totalRecords = this._taskAccessor.getTotalTaskToRecordCount(taskId);
            result.push({
                label: sn_i18n.Message.getMessage("sn_cmdb_ws", "Total records to delete"),
                displayValue: totalRecords
            });
        }
        return result;
    },

    /**
     * Get percentage complete
     * @param {*} taskId
     * */
    getPercentageComplete: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_TASK_GET_PERCENTAGE_COMPLETE, this._getPercentageComplete, taskId);
    },

    _getPercentageComplete: function(taskId) {
        // TODO: calculate percentage complete based on the task types
    },

    /**
     * Certifies the records for given task and selection of records
     * @param {String} taskId - Task sys_id
     * @param {Object} selectionObject - Object containing selected document sysIds or allRowsSelected/exceptedRecordIds
     * */
    certifyRecords: function(taskId, selectionObject) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_CERTIFY_RECORDS, this._certifyRecords, taskId, selectionObject);
    },

    _certifyRecords: function(taskId, selectionObject) {
        if (selectionObject && selectionObject.count && selectionObject.count > this.UI_DEFAULT_LIMIT.DM_CERTIFY_RECORDS) {
            var progressId = this.progressMonitorUtil.createProgress(taskId);
            gs.eventQueue(this.EVENTS.CERTIFICATION_ACTION_ASYNC, null, progressId, JSON.stringify({
                action: this.ACTIONS.DM_CERT_CERTIFY_RECORDS,
                taskId: taskId,
                selectionObject: selectionObject,
                certificationStatus: this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED
            }));
            return {
                progressId: progressId
            };
        }
        return this._updateRecordCertificationStatus(this.ACTIONS.DM_CERT_CERTIFY_RECORDS, taskId, selectionObject, this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED);
    },

    /**
     * Fails the records for given task and document sys_ids
     * @param {String} taskId 
     * @param {Object} selectionObject - Object containing selected document sysIds or allRowsSelected/exceptedRecordIds
     */
    failRecords: function(taskId, selectionObject) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_FAIL_RECORDS, this._failRecords, taskId, selectionObject);
    },

    _failRecords: function(taskId, selectionObject) {
        if (selectionObject && selectionObject.count && selectionObject.count > this.UI_DEFAULT_LIMIT.DM_CERTIFY_RECORDS) {
            var progressId = this.progressMonitorUtil.createProgress(taskId);
            gs.eventQueue(this.EVENTS.CERTIFICATION_ACTION_ASYNC, null, progressId, JSON.stringify({
                action: this.ACTIONS.DM_CERT_FAIL_RECORDS,
                taskId: taskId,
                selectionObject: selectionObject,
                certificationStatus: this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED
            }));
            return {
                progressId: progressId
            };
        }
        return this._updateRecordCertificationStatus(this.ACTIONS.DM_CERT_FAIL_RECORDS, taskId, selectionObject, this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED);
    },

    /**
     * Save the record-level comment for given task and document sys_ids
     * @param {String} taskId
     * @param {String} comment
     * @param {Object} selectionObject - Object containing selected document sysIds or allRowsSelected/exceptedRecordIds
     */
    saveRecordsComment: function(taskId, comment, selectionObject) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_SAVE_RECORDS_COMMENT, this._saveRecordsComment, taskId, comment, selectionObject);
    },

    _saveRecordsComment: function(taskId, comment, selectionObject) {
        if (selectionObject && selectionObject.count && selectionObject.count > this.UI_DEFAULT_LIMIT.DM_CERTIFY_RECORDS) {
            var progressId = this.progressMonitorUtil.createProgress(taskId);
            gs.eventQueue(this.EVENTS.CERTIFICATION_ACTION_ASYNC, null, progressId, JSON.stringify({
                action: this.ACTIONS.DM_CERT_SAVE_RECORDS_COMMENT,
                taskId: taskId,
                comment: comment,
                selectionObject: selectionObject
            }));
            return {
                progressId: progressId
            };
        }
        return this._updateRecordsComment(this.ACTIONS.DM_CERT_SAVE_RECORDS_COMMENT, taskId, comment, selectionObject);
    },

    _updateRecordCertificationStatus: function(action, taskId, selectionObject, certificationStatus, progressId) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required when certifying or failing records"
        });
        CMDBWsDMUtil.validateRequiredParam(selectionObject, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "At least one record must be selected"),
            details: "A selection object is required when certifying or failing records"
        });
        var certifiedRecords = [];
        var emptyRecords = [];
        var status = {};
        var gr;
        var progressGr;
        if (selectionObject && selectionObject.allRowsSelected) {
            var excludedRecords = selectionObject.exceptedRowIds || [];
            var documentIds = this._getSysIdsMatchingFilter(selectionObject.table, selectionObject.query, excludedRecords);
            gr = this._taskAccessor.getCertificationTaskToDocument(taskId, documentIds);
        } else if (selectionObject && selectionObject.selectedRowIds) {
            gr = this._taskAccessor.getCertificationTaskToDocument(taskId, selectionObject.selectedRowIds);
        }

        // Get the "Allow Empty Fields" value
        var allowEmptyFields = this._taskAccessor.getAllowEmptyFieldsValue(taskId);

        var processedRecords = 0;
        var totalRecords;
        if (progressId) {
            totalRecords = gr.getRowCount();
            progressGr = this.progressMonitorUtil.getProgressById(progressId);
            if (progressGr) {
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }
        while (gr.next()) {
            // TODO - confirm with PM/designer - should we fail all attributes or only pending attributes?
            // currently only failing pending attributes
            var pendingAttributes = this._taskAccessor.getCertificationPendingAttributes(gr);
            if (pendingAttributes.length > 0) {
                var attributeValues = this._getCurrentAttributeValue(gr, pendingAttributes);
                // If it is of type certify, and it has false for allow empty, do a check 
                if (action === this.ACTIONS.DM_CERT_CERTIFY_RECORDS && !allowEmptyFields && this._hasEmptyField(attributeValues)) {
                    // It is empty and we are not allowing it
                    emptyRecords.push(gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI));
                } else {
                    this._taskAccessor.updateCertificationAttributeStatus(gr, attributeValues, certificationStatus, "", action);
                    var key = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
                    status[key] = {
                        attributes: this._taskAccessor.getCertificationAttributeStatus(gr),
                        recordLevelComment: gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT)
                    };
                    certifiedRecords.push(gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI));
                }
            }
            if (progressGr) {
                processedRecords++;
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }

        this._taskAccessor.queueUpdateTaskSuccessPercentEvent(taskId);

        return {
            certifiedRecords: certifiedRecords,
            updatedAttrStatus: status,
            emptyRecords: emptyRecords
        };
    },

    _updateRecordsComment: function(action, taskId, comment, selectionObject, progressId) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required when adding comment to records"
        });
        CMDBWsDMUtil.validateRequiredParam(selectionObject, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "At least one record must be selected"),
            details: "A selection object is required when adding comment to records"
        });

        var gr;
        if (selectionObject && selectionObject.allRowsSelected) {
            var excludedRecords = selectionObject.exceptedRowIds || [];
            var documentIds = this._getSysIdsMatchingFilter(selectionObject.table, selectionObject.query, excludedRecords);
            gr = this._taskAccessor.getCertificationTaskToDocument(taskId, documentIds);
        } else if (selectionObject && selectionObject.selectedRowIds) {
            gr = this._taskAccessor.getCertificationTaskToDocument(taskId, selectionObject.selectedRowIds);
        }

        var progressGr;
        var processedRecords = 0;
        var totalRecords;
        if (progressId) {
            totalRecords = gr.getRowCount();
            progressGr = this.progressMonitorUtil.getProgressById(progressId);
            if (progressGr) {
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }

        var status = {};
        while (gr.next()) {
            gr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT, comment);
            var key = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
            gr.update();

            status[key] = {
                attributes: this._taskAccessor.getCertificationAttributeStatus(gr),
                recordLevelComment: gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT)
            };
            if (progressGr) {
                processedRecords++;
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }

        return {
            updatedAttrStatus: status
        };
    },

    /**
     * Gets the status of the attributes for given task and document sys_ids
     * @param {String} taskId
     * @param {String[]} documentSysIds
     * @returns {Object} - {sys_id: {"attributes" :{status: "", originalVal: "", certifiedVal: ""}, recordLevelComment: ""}}
     * */
    getAttributeStatusAndComment: function(taskId, documentSysIds) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_GET_ATTRIBUTE_STATUS, this._getAttributeStatusAndComment, taskId, documentSysIds);
    },

    _getAttributeStatusAndComment: function(taskId, documentSysIds) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: this.ACTIONS.DM_CERT_GET_ATTRIBUTE_STATUS,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required to get attribute status values"
        });
        CMDBWsDMUtil.validateRequiredParam(documentSysIds, {
            action: this.ACTIONS.DM_CERT_FAIL_RECORDS,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "At least one record must be selected"),
            details: "Document sys_ids are required when getting attribute status"
        });
        var gr = this._taskAccessor.getCertificationTaskToDocument(taskId, documentSysIds);
        var status = {};
        while (gr.next()) {
            var key = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
            status[key] = {
                'attributes': this._taskAccessor.getCertificationAttributeStatus(gr),
                'recordLevelComment': gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT)
            };
        }
        return status;
    },

    /**
     * Certifies the attributes for given task, attributes, and selection object
     * @param {String} taskId
     * @param {String[]} attributes
     * @param {String} comment
     * @param {Object} selectionObject
     * */
    certifyAttributes: function(taskId, attributes, comment, selectionObject) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_CERTIFY_ATTRIBUTES, this._certifyAttributes, taskId, attributes, comment, selectionObject);
    },

    _certifyAttributes: function(taskId, attributes, comment, selectionObject) {
        if (selectionObject && selectionObject.count && selectionObject.count > this.UI_DEFAULT_LIMIT.DM_CERTIFY_RECORDS) {
            var progressId = this.progressMonitorUtil.createProgress(taskId);
            gs.eventQueue(this.EVENTS.CERTIFICATION_ACTION_ASYNC, null, progressId, JSON.stringify({
                action: this.ACTIONS.DM_CERT_CERTIFY_ATTRIBUTES,
                taskId: taskId,
                attributes: attributes,
                comment: comment,
                selectionObject: selectionObject,
                certificationStatus: this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED
            }));
            return {
                progressId: progressId
            };
        }
        return this._updateAttributeCertificationStatus(this.ACTIONS.DM_CERT_CERTIFY_ATTRIBUTES, taskId, attributes, comment, selectionObject, this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED);
    },

    /**
     * Fails the attributes for given task, attributes, and selection object
     * @param {String} taskId
     * @param {String[]} attributes
     * @param {String} comment
     * @param {Object} selectionObject
     * */
    failAttributes: function(taskId, attributes, comment, selectionObject) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_FAIL_ATTRIBUTES, this._failAttributes, taskId, attributes, comment, selectionObject);
    },

    _failAttributes: function(taskId, attributes, comment, selectionObject) {
        if (selectionObject && selectionObject.count && selectionObject.count > this.UI_DEFAULT_LIMIT.DM_CERTIFY_RECORDS) {
            var progressId = this.progressMonitorUtil.createProgress(taskId);
            gs.eventQueue(this.EVENTS.CERTIFICATION_ACTION_ASYNC, null, progressId, JSON.stringify({
                action: this.ACTIONS.DM_CERT_FAIL_ATTRIBUTES,
                taskId: taskId,
                attributes: attributes,
                comment: comment,
                selectionObject: selectionObject,
                certificationStatus: this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED
            }));
            return {
                progressId: progressId
            };
        }
        return this._updateAttributeCertificationStatus(this.ACTIONS.DM_CERT_FAIL_ATTRIBUTES, taskId, attributes, comment, selectionObject, this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED);
    },

    /**
     * Save the attributes for given task, attributes, and selection object
     * @param {String} taskId
     * @param {String[]} attributes
     * @param {String} comment
     * @param {Object} selectionObject
     * */
    saveAttributesComment: function(taskId, attributes, comment, selectionObject) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_SAVE_ATTRIBUTES_COMMENT, this._saveAttributesComment, taskId, attributes, comment, selectionObject);
    },

    _saveAttributesComment: function(taskId, attributes, comment, selectionObject) {
        if (selectionObject && selectionObject.count && selectionObject.count > this.UI_DEFAULT_LIMIT.DM_CERTIFY_RECORDS) {
            var progressId = this.progressMonitorUtil.createProgress(taskId);
            gs.eventQueue(this.EVENTS.CERTIFICATION_ACTION_ASYNC, null, progressId, JSON.stringify({
                action: this.ACTIONS.DM_CERT_SAVE_ATTRIBUTES_COMMENT,
                taskId: taskId,
                attributes: attributes,
                comment: comment,
                selectionObject: selectionObject
            }));
            return {
                progressId: progressId
            };
        }
        return this._updateAttributesComment(this.ACTIONS.DM_CERT_SAVE_ATTRIBUTES_COMMENT, taskId, attributes, comment, selectionObject);
    },

    _updateAttributeCertificationStatus: function(action, taskId, attributes, comment, selectionObject, certificationStatus, progressId) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required when certifying or failing attributes"
        });
        CMDBWsDMUtil.validateRequiredParam(attributes, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "At least one attribute must be selected"),
            details: "Attribute names are required when certifying or failing attributes"
        });
        var certifiedRecords = [];
        var emptyRecords = [];
        var status = {};
        var gr;
        var progressGr;
        if (selectionObject && selectionObject.allRowsSelected) {
            var excludedRecords = selectionObject.exceptedRowIds || [];
            var documentIds = this._getSysIdsMatchingFilter(selectionObject.table, selectionObject.query, excludedRecords);
            gr = this._taskAccessor.getCertificationTaskToDocument(taskId, documentIds);
        } else if (selectionObject && selectionObject.selectedRowIds) {
            gr = this._taskAccessor.getCertificationTaskToDocument(taskId, selectionObject.selectedRowIds);
        }

        // Get the "Allow Empty Fields" value
        var allowEmptyFields = this._taskAccessor.getAllowEmptyFieldsValue(taskId);

        var processedRecords = 0;
        var totalRecords;
        if (progressId) {
            totalRecords = gr.getRowCount();
            progressGr = this.progressMonitorUtil.getProgressById(progressId);
            if (progressGr) {
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }
        while (gr.next()) {
            var attributeValues = this._getCurrentAttributeValue(gr, attributes);
            // If it is of type certify, and it has false for allow empty, do a check 
            if (action === this.ACTIONS.DM_CERT_CERTIFY_ATTRIBUTES && !allowEmptyFields && this._hasEmptyField(attributeValues)) {
                // It is empty and we are not allowing it
                emptyRecords.push(gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI));
            } else {
                this._taskAccessor.updateCertificationAttributeStatus(gr, attributeValues, certificationStatus, comment, action);
                var key = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
                status[key] = {
                    attributes: this._taskAccessor.getCertificationAttributeStatus(gr),
                    recordLevelComment: gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT)
                };
                var recordStatus = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS);
                if (recordStatus != this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.PENDING) {
                    certifiedRecords.push(gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI));
                }
            }
            if (progressGr) {
                processedRecords++;
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }

        this._taskAccessor.queueUpdateTaskSuccessPercentEvent(taskId);

        return {
            certifiedRecords: certifiedRecords,
            updatedAttrStatus: status,
            emptyRecords: emptyRecords
        };
    },

    _updateAttributesComment: function(action, taskId, attributes, comment, selectionObject, progressId) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required when adding comment to attributes"
        });
        CMDBWsDMUtil.validateRequiredParam(attributes, {
            action: action,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "At least one attribute must be selected"),
            details: "Attribute names are required when adding comment to attributes"
        });

        var gr;
        if (selectionObject && selectionObject.allRowsSelected) {
            var excludedRecords = selectionObject.exceptedRowIds || [];
            var documentIds = this._getSysIdsMatchingFilter(selectionObject.table, selectionObject.query, excludedRecords);
            gr = this._taskAccessor.getCertificationTaskToDocument(taskId, documentIds);
        } else if (selectionObject && selectionObject.selectedRowIds) {
            gr = this._taskAccessor.getCertificationTaskToDocument(taskId, selectionObject.selectedRowIds);
        }

        var progressGr;
        var processedRecords = 0;
        var totalRecords;
        if (progressId) {
            totalRecords = gr.getRowCount();
            progressGr = this.progressMonitorUtil.getProgressById(progressId);
            if (progressGr) {
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }

        var status = {};
        while (gr.next()) {
            var attributeStatusObj = this._taskAccessor.getCertificationAttributeStatus(gr);
            for (var i = 0; i < attributes.length; i++) {
                attributeStatusObj[attributes[i]][this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT] = comment;
                this._taskAccessor.updateAttributeComment(gr, attributes[i], comment);
            }
            gr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.ATTRIBUTE_STATUS, JSON.stringify(attributeStatusObj));
            gr.update();

            var key = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
            status[key] = {
                attributes: attributeStatusObj,
                recordLevelComment: gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT)
            };
            if (progressGr) {
                processedRecords++;
                this.progressMonitorUtil.updateProgress(progressGr, processedRecords, totalRecords);
            }
        }

        return {
            updatedAttrStatus: status
        };
    },

    syncCertificationAttributeStatusReportRecord: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_UPDATE_ATTRIBUTE_VALUE, this._syncCertificationAttributeStatusReportRecord, taskId);
    },

    _syncCertificationAttributeStatusReportRecord: function(taskId) {
        this._taskAccessor.syncCertificationAttributeStatusReportRecord(taskId);
    },

    /**
     * Saves the attribute values
     * @param {String} taskId
     * @param {Object} docSysIdToAttributeValues - {document_sys_id: {name: value}}
     * */
    saveAttributes: function(taskId, docSysIdToAttributeValues) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_SAVE_ATTRIBUTES, this._saveAttributes, taskId, docSysIdToAttributeValues);
    },

    _saveAttributes: function(taskId, docSysIdToAttributeValues) {
        var documentSysIds = Object.keys(docSysIdToAttributeValues);
        var gr = this._taskAccessor.getCertificationTaskToDocument(taskId, documentSysIds);
        while (gr.next()) {
            var attributeValue = docSysIdToAttributeValues[gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI)];
            this._updateAttributeValue(gr, attributeValue);
        }
    },

    /**
     * Updates the attribute value in the source table
     * @param {GlideRecord} gr - certificationTaskToDocument gr
     * @param {Object} attributeValues
     * */
    _updateAttributeValue: function(gr, attributeValues) {
        var attributes = Object.keys(attributeValues);
        var table = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE_COL);
        var sysId = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
        var recordGr = new GlideRecordSecure(table);
        recordGr.get(sysId);
        if (!recordGr.isValidRecord()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Unable to update certification value. Invalid record {0}:{1}", {
                    0: table,
                    1: sysId
                }),
                action: this.ACTIONS.DM_CERT_UPDATE_ATTRIBUTE_VALUE,
                source: this.DM_ERROR_SOURCE,
                details: "Record not found when trying to update attribute value in " + table + " for sys_id " + sysId,
                logError: true
            });
        }
        for (var i = 0; i < attributes.length; i++) {
            var _attribute = attributes[i];
            recordGr.setValue(_attribute, attributeValues[_attribute]);
        }
        recordGr.update();
    },

    /**
     * Gets the current attribute value from the source table for given attributes
     * @param {GlideRecord} gr - certificationTaskToDocument gr
     * @param {String[]} attributes
     * @returns {Object} - {name: value}
     * */
    _getCurrentAttributeValue: function(gr, attributes) {
        var attributeValues = {};
        var table = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE_COL);
        var sysId = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
        var recordGr = new GlideRecordSecure(table);
        recordGr.get(sysId);
        if (!recordGr.isValidRecord()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INVALID_RECORD,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Unable to get certification records. Invalid record {0}:{1}", {
                    0: table,
                    1: sysId
                }),
                action: this.ACTIONS.DM_CERT_GET_CURRENT_ATTRIBUTE_VALUE,
                source: this.DM_ERROR_SOURCE,
                details: "Record not found when trying to fetch current attribute value in " + table + " for sys_id " + sysId,
                logError: true
            });
        }
        for (var i = 0; i < attributes.length; i++) {
            var _attribute = attributes[i];
            attributeValues[_attribute] = this.wsUtil.getFieldValue(recordGr, _attribute);
        }
        return attributeValues;
    },

    validateTaskAssignmentToCurrentUser: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_VALIDATE_TASK_ASSIGNMENT, this._validateTaskAssignmentToCurrentUser, taskId);
    },

    _validateTaskAssignmentToCurrentUser: function(taskId) {
        var currentUserId = gs.getUserID();

        var result = {
            invalidTask: true,
            userNotAssigned: true,
            userNotWithinGroup: true,
            userIsMaint: this.wsUtil.isUserMaint(),
            userIsDataManagerAdmin: gs.getUser().hasRole(this.ROLE.DATA_MANAGER_ADMIN),
            userCanUpdateTaskApproval: false,
            userCanReadTable: false,
            userManagesAssignee: false
        };

        var taskGr = new GlideRecord(this.TASK.TABLE);
        if (taskGr.get(taskId)) {
            result.invalidTask = false;
            var assignmentGroupId = taskGr.getValue(this.TASK.ASSIGNMENT_GROUP);
            var assignedUserId = taskGr.getValue(this.TASK.ASSIGNED_TO);
            if (assignedUserId == currentUserId) {
                result.userNotAssigned = false;
            } else if (!gs.nil(assignedUserId)) {
                var manageGr = new GlideRecord(this.SYS_USER.TABLE);
                manageGr.addQuery(this.SYS_DICTIONARY.MANAGER, currentUserId);
                manageGr.addQuery(this.SYS_USER.SYS_ID, assignedUserId);
                manageGr.query();
                if (manageGr.next()) {
                    result.userManagesAssignee = true;
                }

            }
            if (assignmentGroupId) {
                var groupGr = new GlideRecord(this.SYS_USER_GROUP_MEMBER.TABLE);
                groupGr.addQuery(this.SYS_USER_GROUP_MEMBER.GROUP, assignmentGroupId);
                groupGr.addQuery(this.SYS_USER_GROUP_MEMBER.USER, currentUserId);
                groupGr.setLimit(1);
                groupGr.query();
                if (groupGr.next()) {
                    result.userNotWithinGroup = false;
                }

                var mgrGr = new GlideRecord(this.SYS_DICTIONARY.SYS_USER_GROUP);
                mgrGr.addQuery(this.SYS_DICTIONARY.SYS_ID, assignmentGroupId);
                mgrGr.addQuery(this.SYS_DICTIONARY.MANAGER, currentUserId);
                mgrGr.setLimit(1);
                mgrGr.query();
                if (mgrGr.next()) {
                    result.userNotWithinGroup = false;
                }
            }
            if (taskGr.approval.canWrite()) {
                result.userCanUpdateTaskApproval = true;
            }
            // Check if user can read the certification table since this can be any table outside of cmdb_ci
            if (taskGr.policy_id.cmdb_policy_type == this.OOB_POLICY_TYPES.CERTIFICATION.sys_id) {
                result.userCanReadTable = this._canReadCertificationTable(taskGr);
            }
        }

        return result;
    },

    approveLifeCycleTask: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_APPROVE_TASK, this._approveLifeCycleTask, taskId);
    },

    _approveLifeCycleTask: function(taskId) {
        this._taskAccessor.approveTask(taskId);
    },

    getTaskAssignmentFilterQuery: function() {
        return this._taskAccessor.getTaskAssignmentFilterQuery();
    },

    submitCertificationTask: function(taskId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_SUBMIT_TASK, this._submitCertificationTask, taskId);
    },

    _submitCertificationTask: function(taskId) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: this.ACTIONS.DM_CERT_SUBMIT_TASK,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required to submit task"
        });
        if (this._taskAccessor.hasPendingCertificationRecords(taskId)) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DM_INCOMPLETE_TASK,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "This task has records that have not been reviewed."),
                action: this.ACTIONS.DM_CERT_SUBMIT_TASK,
                source: this.DM_ERROR_SOURCE,
                details: "Certification task with id: " + taskId + " has records in pending state",
                logError: true
            });
        } else {
            var taskGr = this._taskAccessor.getTaskById(taskId);
            taskGr.setValue(this.TASK.STATE, this.TASK.STATE_OPTIONS.CLOSED_COMPLETE);
            taskGr.update();
        }
    },

    insertCertExecutionContext: function(taskId, policyId) {
        return CMDBWsDMUtil.execute.call(this, this.ACTIONS.DM_CERT_INSERT_EXECUTION_CONTEXT, this._insertCertExecutionContext, taskId, policyId);
    },

    _insertCertExecutionContext: function(taskId, policyId) {
        CMDBWsDMUtil.validateRequiredParam(taskId, {
            action: this.ACTIONS.DM_CERT_INSERT_EXECUTION_CONTEXT,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task ID is required"),
            details: "Task ID is required when inserting execution context"
        });
        CMDBWsDMUtil.validateRequiredParam(policyId, {
            action: this.ACTIONS.DM_CERT_INSERT_EXECUTION_CONTEXT,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Policy ID is required"),
            details: "Policy ID is required when inserting execution context"
        });
        var configGr = new GlideRecord(this.CERTIFICATION_POLICY.TABLE);
        if (configGr.get(policyId)) {
            var context = {
                table: configGr.getValue(this.CERTIFICATION_POLICY.TABLE_COL),
                displayFields: configGr.getValue(this.CERTIFICATION_POLICY.DISPLAY_FIELDS),
                certificationFields: configGr.getValue(this.CERTIFICATION_POLICY.CERTIFICATION_FIELDS),
                allowEmptyFields: global.JSUtil.getBooleanValue(configGr, this.CERTIFICATION_POLICY.ALLOW_EMPTY_FIELDS),
                allowFieldUpdates: global.JSUtil.getBooleanValue(configGr, this.CERTIFICATION_POLICY.ALLOW_FIELD_UPDATES)
            };
            var contextGr = new GlideRecord(this.TASK_EXECUTION_CONTEXT.TABLE);
            contextGr.initialize();
            contextGr.setValue(this.TASK_EXECUTION_CONTEXT.TASK, taskId);
            contextGr.setValue(this.TASK_EXECUTION_CONTEXT.CONTEXT, JSON.stringify(context));
            contextGr.insert();
        }
    },

    _getSysIdsMatchingFilter: function(table, query, excludedSysIds) {
        var sysIds = [];
        var gr = new GlideRecordSecure(table);
        gr.addEncodedQuery(query);
        if (excludedSysIds && excludedSysIds.length) {
            gr.addQuery(this.SYS_ID, 'NOT IN', excludedSysIds);
        }
        gr.query();
        while (gr.next()) {
            sysIds.push(gr.getUniqueValue());
        }

        return sysIds;
    },

    _hasEmptyField: function(attributeValues) {
        for (var key in attributeValues) {
            if (gs.nil(attributeValues[key]))
                return true;
        }
        return false;
    },

    _canReadCertificationTable: function(taskGr) {
        var contextGr = new GlideRecord(this.TASK_EXECUTION_CONTEXT.TABLE);
        contextGr.addQuery(this.TASK_EXECUTION_CONTEXT.TASK, taskGr.sys_id.toString());
        contextGr.setLimit(1);
        contextGr.query();
        var certTable;
        if (contextGr.next()) {
            var context = contextGr.getValue(this.TASK_EXECUTION_CONTEXT.CONTEXT);
            context = JSON.parse(context);
            certTable = context.table;

        } else {
            certTable = taskGr.policy_id.table;
        }
        try {
            var tableGr = new GlideRecord(certTable);
            return tableGr.canRead();
        } catch (e) {
            return false;
        }
    },

    type: 'CMDBWsDMTaskManager'
});
