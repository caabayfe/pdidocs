var CMDBWsDMTaskAccessor = Class.create();
CMDBWsDMTaskAccessor.prototype = Object.extendsObject(CMDBWsDMConstants, {
	initialize: function() {
		this.wsUtil = new sn_cmdb_ws.CMDBWorkspaceUtil();
	},

	ERROR_MESSAGES: {
		UNAUTHORIZED: {
			error: {
				code: 'UNAUTHORIZED',
				message: 'This task is not assigned to you.'
			}
		},
		INVALID_ACTION: {
			error: {
				code: 'INVALID_ACTION',
				message: 'Invalid action'
			}
		},
		INVALID_INPUT: {
			error: {
				code: 'INVALID_INPUT',
				message: 'At least one CI sysId required.'
			}
		},
		TASK_APPROVAL_FAILED: {
			error: {
				code: 'TASK_APPROVAL_FAILED',
				message: 'Task approval failed'
			}
		},
	},

	/**
	 * Gets the task by given task id
	 * @param {String} taskId
	 * @returns {GlideRecord}
	 * @param {Boolean} checkAcl - whether or not not check the caller's ACL
	 * */
	getTaskById: function(taskId, checkAcl) {
		var taskGr;
		if (checkAcl) {
			taskGr = new GlideRecordSecure(this.TASK.TABLE);
		} else {
			taskGr = new GlideRecord(this.TASK.TABLE);
		}
		taskGr.get(taskId);
		if (!taskGr.isValidRecord())
			throw new CMDBWsError({
				code: this.ERROR_CODES.DM_INVALID_RECORD,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid taskId:{0}", {
					0: taskId
				}),
				action: this.ACTIONS.DM_GET_TASK,
				source: this.DM_ERROR_SOURCE,
				details: "Invalid taskId=" + taskId,
				logError: false
			});

		return taskGr;
	},

	/**
	 * Gets the task to document records for given task and document sys_ids
	 * @param {String} taskId
	 * @param {String[]} includedIds
	 * @returns {GlideRecord}
	 * */
	getCertificationTaskToDocument: function(taskId, includedIds) {
		var gr = new GlideRecord(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		gr.addQuery(this.CERTIFICATION_TASK_TO_DOCUMENT.TASK, taskId);
		if (includedIds && includedIds.length > 0) {
			gr.addQuery(this.CERTIFICATION_TASK_TO_DOCUMENT.CI, "IN", includedIds);
		}
		gr.query();

		if (!gr.hasNext())
			throw new CMDBWsError({
				code: this.ERROR_CODES.DM_INVALID_RECORD,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Certification task ({0}) does not have any associated certification records.", {
					0: taskId
				}),
				action: this.ACTIONS.DM_GET_TASK,
				source: this.DM_ERROR_SOURCE,
				details: "Certification task (" + taskId + ") does not have any task to document records for given document sys_ids - " + documentSysIds.join(),
				logError: false
			});
		return gr;
	},

	initializeAttributeStatus: function(taskToDocumentId) {
		var taskToDocumentGr = new GlideRecord(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		if (!taskToDocumentGr.get(taskToDocumentId)) {
			throw new CMDBWsError({
				code: this.ERROR_CODES.DM_INVALID_RECORD,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Cannot find certification task to document record with id {0}.", {
					0: taskToDocumentId
				}),
				action: this.ACTIONS.DM_CERT_SAVE_ATTRIBUTES,
				source: this.DM_ERROR_SOURCE,
				details: "Cannot find certification task to document record with id " + taskToDocumentId,
				logError: false
			});
		}
		var table = taskToDocumentGr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE_COL);
		var recordId = taskToDocumentGr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
		var certificationFieldsStr = taskToDocumentGr.cmdb_data_management_task.policy_id.certification_fields;
		if (gs.nil(certificationFieldsStr)) {
			throw new CMDBWsError({
				code: this.ERROR_CODES.DM_INVALID_RECORD,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Empty certification fields.", {}),
				action: this.ACTIONS.DM_CERT_SAVE_ATTRIBUTES,
				source: this.DM_ERROR_SOURCE,
				details: "Empty certification fields",
				logError: false
			});
		}
		certificationFieldsStr += '';
		var certificationFields = certificationFieldsStr.split(',');

		var attributeStatusObj = {};
		var tableGr = new GlideRecord(table);
		if (!tableGr.get(recordId)) {
			throw new CMDBWsError({
				code: this.ERROR_CODES.DM_INVALID_RECORD,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Cannot find record with id {0} in table {1}.", {
					0: recordId,
					1: table
				}),
				action: this.ACTIONS.DM_CERT_SAVE_ATTRIBUTES,
				source: this.DM_ERROR_SOURCE,
				details: "Cannot find record with id " + recordId + ' in table ' + table,
				logError: false
			});
		}
		for (var i = 0; i < certificationFields.length; i++) {
			var certificationField = certificationFields[i];
			var attributeValue = this.wsUtil.getFieldValue(tableGr, certificationField);
			var attributeStatus = new CMDBWsDMCertificationAttributeStatusDto(certificationField);
			attributeStatus.setStatus(this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.PENDING);
			attributeStatus.setCertifiedValue('');
			attributeStatus.setComment('');
			attributeStatus.setOriginalVal(attributeValue);
			attributeStatusObj[certificationField] = attributeStatus;
		}
		taskToDocumentGr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.ATTRIBUTE_STATUS, JSON.stringify(attributeStatusObj));
		taskToDocumentGr.update();
	},

	/**
	 * Updates the given status of the attributes for a given record
	 * @param {GlideRecord} gr - certificationTaskToDocument gr
	 * @param {Object} attributeValues
	 * {
	 *    "attribute1": "value1"
	 * }
	 * @param {String} status
	 * */
	updateCertificationAttributeStatus: function(gr, attributeValues, status, comment, action) {
		var attributes = Object.keys(attributeValues);
		var attributeStatusObj = this.getCertificationAttributeStatus(gr);
		var taskToDocumentId = gr.getUniqueValue();
		var taskId = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.TASK);
		var table = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE_COL);
		var documentId = gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
		
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			var attributeStatus = attributeStatusObj[attribute];
			attributeStatus.setStatus(status);
			// don't overwrite existing comment with empty comment 
			if (!gs.nil(comment) && (action === this.ACTIONS.DM_CERT_CERTIFY_ATTRIBUTES || action === this.ACTIONS.DM_CERT_FAIL_ATTRIBUTES))
				attributeStatus.setComment(comment);
			attributeStatus.setCertifiedValue(attributeValues[attribute]);

			this.insertOrUpdateAttributeStatusReportRecord(taskId, taskToDocumentId, attribute, status, comment, attributeValues[attribute], attributeStatus[this.CERTIFICATION_TASK_TO_DOCUMENT.ORIGINAL_VAL], table, documentId);
		}
		gr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.ATTRIBUTE_STATUS, JSON.stringify(attributeStatusObj));
		var certRecord = this._evaluateCertRecordBasedOnAttrStatus(attributeStatusObj);
		gr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS, certRecord.status);
		gr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CONTAINS_CERTIFIED_ATTRIBUTES, certRecord.contains_certified_attributes);
		gr.setValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CONTAINS_FAILED_ATTRIBUTES, certRecord.contains_failed_attributes);
		gr.update();
	},

	queueUpdateTaskSuccessPercentEvent: function(taskId) {
		gs.eventQueue(this.EVENTS.CERTIFICATION_ATTRIBUTE_STATUS_UPDATED, null, taskId);
	},

	updateTaskSuccessPercent: function(taskId) {
		var totalCertElementCount = 0;
		var pendingCertElementCount = 0;
		var taskToDocumentGr = new GlideRecord(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		taskToDocumentGr.addQuery(this.CERTIFICATION_TASK_TO_DOCUMENT.TASK, taskId);
		taskToDocumentGr.query();
		while (taskToDocumentGr.next()) {
			var attributeStatusObj = this.getCertificationAttributeStatus(taskToDocumentGr);
			var attributes = Object.keys(attributeStatusObj);
			for (var i = 0; i < attributes.length; i++) {
				totalCertElementCount++;
				var attribute = attributes[i];
				var attributeStatus = attributeStatusObj[attribute];
				if (attributeStatus.isPending()) {
					pendingCertElementCount++;
				}
			}
		}
		var successPercent = 100 * ((totalCertElementCount - pendingCertElementCount) / totalCertElementCount);
		var taskGr = this.getTaskById(taskId);
		taskGr.setValue(this.TASK.SUCCESS_PERCENT, successPercent);
		taskGr.update();
	},

	insertOrUpdateAttributeStatusReportRecord: function(taskId, taskToDocumentId, attribute, status, comment, certifiedValue, originalValue, table, documentId) {
		var attributeStatusGr = new GlideRecord(this.CERTIFICATION_ATTRIBUTE_STATUS.TABLE);
		attributeStatusGr.addQuery(this.CERTIFICATION_ATTRIBUTE_STATUS.CERTIFICATION_TASK_TO_DOCUMENT, taskToDocumentId);
		attributeStatusGr.addQuery(this.CERTIFICATION_ATTRIBUTE_STATUS.ELEMENT, attribute);
		attributeStatusGr.setLimit(1);
		attributeStatusGr.query();
		if (attributeStatusGr.next()) {
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.STATUS, status);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.COMMENT, comment);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.CERTIFIED_VALUE, certifiedValue);
			attributeStatusGr.update();
		} else if (status == this.CERTIFICATION_ATTRIBUTE_STATUS.STATUS_OPTIONS.FAILED) {
			attributeStatusGr.initialize();
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.TASK, taskId);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.CERTIFICATION_TASK_TO_DOCUMENT, taskToDocumentId);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.TABLE_COL, table);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.CERTIFICATION_RECORD, documentId);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.ELEMENT, attribute);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.STATUS, status);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.ORIGINAL_VALUE, originalValue);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.CERTIFIED_VALUE, certifiedValue);
			attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.COMMENT, comment);
			attributeStatusGr.insert();
		}
	},

	updateAttributeComment: function(gr, attribute, comment) {
        var taskToDocumentId = gr.getUniqueValue();
        var attributeStatusGr = new GlideRecord(this.CERTIFICATION_ATTRIBUTE_STATUS.TABLE);
        attributeStatusGr.addQuery(this.CERTIFICATION_ATTRIBUTE_STATUS.CERTIFICATION_TASK_TO_DOCUMENT, taskToDocumentId);
        attributeStatusGr.addQuery(this.CERTIFICATION_ATTRIBUTE_STATUS.ELEMENT, attribute);
        attributeStatusGr.setLimit(1);
        attributeStatusGr.query();
        // update attribute comment only if attribute record exists
        if (attributeStatusGr.next()) {
            attributeStatusGr.setValue(this.CERTIFICATION_ATTRIBUTE_STATUS.COMMENT, comment);
            attributeStatusGr.update();
        }
    },


	syncCertificationAttributeStatusReportRecord: function(taskId) {
		var taskToDocumentGr = new GlideRecord(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		taskToDocumentGr.addQuery(this.CERTIFICATION_TASK_TO_DOCUMENT.TASK, taskId);
		taskToDocumentGr.query();
		while (taskToDocumentGr.next()) {
			var taskToDocumentId = taskToDocumentGr.getUniqueValue();
			var table = taskToDocumentGr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE_COL);
			var documentId = taskToDocumentGr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.CI);
			var attributeStatusObj = this.getCertificationAttributeStatus(taskToDocumentGr);
			var attributes = Object.keys(attributeStatusObj);
			for (var i = 0; i < attributes.length; i++) {
				var attribute = attributes[i];
				var attributeStatus = attributeStatusObj[attribute];
				if (attributeStatus.isFailed()) {
					this.insertOrUpdateAttributeStatusReportRecord(taskId, taskToDocumentId, attribute, 
					attributeStatus[this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS], attributeStatus[this.CERTIFICATION_TASK_TO_DOCUMENT.COMMENT], 
					attributeStatus[this.CERTIFICATION_TASK_TO_DOCUMENT.CERTIFIED_VAL], attributeStatus[this.CERTIFICATION_TASK_TO_DOCUMENT.ORIGINAL_VAL], table, documentId);
				}
			}
		}
	},

	/**
	 * Gets list of certification pending attributes for given record
	 * @param {GlideRecord} gr - certificationTaskToDocument gr
	 * @returns {String[]} - list of pending attributes
	 * */
	getCertificationPendingAttributes: function(gr) {
		var attributeStatusObj = this.getCertificationAttributeStatus(gr);
		var attributes = Object.keys(attributeStatusObj);
		var pendingAttributes = [];
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			var attributeStatus = attributeStatusObj[attribute];
			if (attributeStatus.isPending()) {
				pendingAttributes.push(attribute);
			}
		}
		return pendingAttributes;
	},

	hasPendingCertificationRecords: function(taskId) {
		var taskToDocumentGr = new GlideRecord(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		taskToDocumentGr.addQuery(this.CERTIFICATION_TASK_TO_DOCUMENT.TASK, taskId);
		taskToDocumentGr.addQuery(this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS, this.CERTIFICATION_ATTRIBUTE_STATUS.STATUS_OPTIONS.PENDING);
		taskToDocumentGr.setLimit(1);
		taskToDocumentGr.query();

		return taskToDocumentGr.hasNext();
	},

	/**
	 * Evaluates the record status based on the attribute status
	 * @param {Object} attributeStatusObj
	 *  {
	 *     "attribute1": CMDBWsDMCertificationAttributeStatusDto
	 *  }
	 * @returns {JSONObject} 
	 * 	status
	 *  contains_certified_attributes
	 *  contains_failed_attributes
	 * */
	_evaluateCertRecordBasedOnAttrStatus: function(attributeStatusObj) {
		var result = {};
		var _status;
		var _contains_failed_attributes = false;
		var _contains_certified_attributes = false;
		var attributes = Object.keys(attributeStatusObj);
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			var attributeStatus = attributeStatusObj[attribute];
			
			if (attributeStatus.isPending()) {
				_status = this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.PENDING;
			}

			// if at least one attribute is pending, the record status should be pending
			if (_status == this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.PENDING && _contains_certified_attributes && _contains_failed_attributes)
				break;
			
			if (attributeStatus.isFailed()) {
				// if at least one attribute is failed and nothing is pending, the record status should be failed
				if (global.JSUtil.nil(_status)) {
					_status = this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.FAILED;
				}
				_contains_failed_attributes = true;
			}

			if (attributeStatus.isCertified()) {
				_contains_certified_attributes = true;
			}
		}
		// if there are no pending or failed records, the record status should be certified
		result.status = _status ? _status : this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS_OPTIONS.CERTIFIED;
		result.contains_failed_attributes = _contains_failed_attributes;
		result.contains_certified_attributes = _contains_certified_attributes;
		return result;
	},

	/**
	 * Gets and parses the attribute status for given record
	 * @param {GlideRecord} gr - certificationTaskToDocument gr
	 * @returns {Object} - attribute statuses
	 *  {
	 *     "attribute1": CMDBWsDMCertificationAttributeStatusDto,
	 *     "attribute2": CMDBWsDMCertificationAttributeStatusDto
	 *  }
	 * */
	getCertificationAttributeStatus: function(gr) {
		var attributeStatusObj = JSON.parse(gr.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.ATTRIBUTE_STATUS));
		var attributes = Object.keys(attributeStatusObj);
		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			var attributeStatus = new CMDBWsDMCertificationAttributeStatusDto(attribute);
			attributeStatus.populate(attributeStatusObj[attribute]);
			attributeStatusObj[attribute] = attributeStatus;
		}
		return attributeStatusObj;
	},

	getCertificationRecordSummary: function(taskId) {
		var ga = new GlideAggregate(this.CERTIFICATION_TASK_TO_DOCUMENT.TABLE);
		ga.addQuery(this.CERTIFICATION_TASK_TO_DOCUMENT.TASK, taskId);
		ga.addAggregate('COUNT');
		ga.groupBy(this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS);
		ga.query();
		var result = {};
		while (ga.next()) {
			var status = ga.getValue(this.CERTIFICATION_TASK_TO_DOCUMENT.STATUS);
			var count = parseInt(ga.getAggregate('COUNT'));
			result[status] = count;
		}
		return result;
	},

	getTaskToCiTableName: function(taskId) {
		var taskGr = this.getTaskById(taskId, false);
		return taskGr[this.TASK.POLICY].getRefRecord()[this.POLICY.TYPE].getRefRecord()[this.POLICY_TYPE.TASK_TO_CI_TABLE].getRefRecord().getValue("name");
	},

	getTotalTaskToRecordCount: function(taskId) {
		var taskToCiTable = this.getTaskToCiTableName(taskId);
		return CMDBWsDMUtil.getRowCount(taskToCiTable, this.TASK_TO_CI.TASK + "=" + taskId);
	},

	getPolicyTypeForTaskId: function(taskId) {
		var taskGr = this.getTaskById(taskId, true);
		var policyTypeId = taskGr[this.TASK.POLICY].getRefRecord().getValue(this.POLICY.TYPE);
		return CMDBWsDMUtil.getPolicyTypeInfo(policyTypeId);
	},

	approveTask: function(taskId) {
		var gr = new GlideRecord(this.TASK_APPROVAL.TABLE);
		gr.addQuery(this.TASK_APPROVAL.SYSAPPROVAL, taskId);
		gr.addQuery(this.TASK_APPROVAL.APPROVER, gs.getUserID());
		gr.query();

		if (gr.next()) {
			gr.setValue(this.TASK_APPROVAL.STATE, this.TASK_APPROVAL.STATE_OPTIONS.APPROVED);
			if (!gr.update()) {
				throw new CMDBWsError({
					code: this.ERROR_CODES.TASK_APPROVAL_FAILED,
					message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task approval failed"),
					action: this.ACTIONS.DM_APPROVE_TASK,
					source: this.DM_ERROR_SOURCE,
					details: "Unable to update the approval state to Approved for this record {0} " + gr.sys_id,
					logError: true
				});
			}
		} else {
			var taskGr = this.getTaskById(taskId, true);
			if (taskGr.approval.canWrite()) {
				taskGr.setValue(this.TASK.APPROVAL, this.TASK.APPROVAL_OPTIONS.APPROVED);
				if (!taskGr.update()) {
					throw new CMDBWsError({
						code: this.ERROR_CODES.TASK_APPROVAL_FAILED,
						message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Task approval failed"),
						action: this.ACTIONS.DM_APPROVE_TASK,
						source: this.DM_ERROR_SOURCE,
						details: "Unable to update the approval field value to Approved for this task {0} " + taskGr.number,
						logError: true
					});
				}
			} else {
				throw new CMDBWsError({
					code: this.ERROR_CODES.TASK_APPROVAL_FAILED,
					message: sn_i18n.Message.getMessage("sn_cmdb_ws", "This task doesn't have approval record assigned to you."),
					action: this.ACTIONS.DM_APPROVE_TASK,
					source: this.DM_ERROR_SOURCE,
					details: "Unable to find record in sysapproval_approver table for task " + taskId + " and approver = " + gs.getUserID(),
					logError: true
				});
			}
		}
	},

	excludeRecords: function(taskId, taskToCiTable, sysIds, userComment, allRecordsSelected, excludedSysIds) {
		var successCount = 0;
		var failureCount = 0;
		var taskToCiList = [];
		var ciList = [];

		var policyTypeInfo = this.getPolicyTypeForTaskId(taskId);

		var taskToCiGr = new GlideRecord(taskToCiTable);
		if (allRecordsSelected) {
			taskToCiGr.addQuery(this.TASK_TO_CI.TASK, taskId);
			if (excludedSysIds) {
				taskToCiGr.addQuery(this.TASK_TO_CI.SYS_ID, this.QUERY_FILTERS.NOT_IN, excludedSysIds);
			}
		} else {
			taskToCiGr.addQuery(this.TASK_TO_CI.SYS_ID, this.QUERY_FILTERS.IN, sysIds);
		}
		taskToCiGr.query();

		while (taskToCiGr.next()) {
			taskToCiList.push(taskToCiGr.getValue(this.TASK_TO_CI.SYS_ID));
			ciList.push(taskToCiGr.getValue(this.TASK_TO_CI.CI));
		}

		var result = {};
		result = new CMDBWsDMExclusionListAccessor().addCIToExclusionList(policyTypeInfo.sys_id, ciList);
		if (result && result.erroredCiSysIds && result.erroredCiSysIds.length > 0) {
			failureCount = result.erroredCiSysIds.length;
		}

		if (result && result.successfulCiNames && result.successfulCiNames.length > 0 && result.successfulCiNames) {
			//Deleting task to ci records for excluded CIs 
			var taskToCIgr = new GlideRecord(taskToCiTable);
			taskToCIgr.addQuery(this.TASK_TO_CI.SYS_ID, this.QUERY_FILTERS.IN, taskToCiList);
			if (failureCount > 0) {
				taskToCIgr.addQuery(this.TASK_TO_CI.CI, this.QUERY_FILTERS.NOT_IN, result.erroredCiSysIds.join());
			}
			taskToCIgr.deleteMultiple();

			var taskGr = this.getTaskById(taskId, true);
			var reasonCommentText = "";
			if (userComment)
				reasonCommentText = gs.getMessage("CIs were excluded for the following reason: {0}\n", userComment);
			var impactedCiCommentText = gs.getMessage("The following CIs were excluded from policy type - {0}: \n{1}", [policyTypeInfo.name, result.successfulCiNames.join(", ")]);
			taskGr.comments = gs.getMessage("{0} {1}", [reasonCommentText, impactedCiCommentText]);
			taskGr.update();

			successCount = result.successfulCiNames.length;
		}

		return {
			action: this.ACTIONS.DM_EXCLUDE_RECORDS,
			successCount: successCount,
			failureCount: failureCount
		};
	},

	getTaskAssignmentFilterQuery: function() {
		var WS = new CMDBWsConstants();

		var assignmentFilter = this.TASK.ASSIGNED_TO + WS.OPERATORS.DYNAMIC + WS.DYNAMIC_FILTERS.ME + WS.OPERATORS.OR + 
				this.TASK.ASSIGNMENT_GROUP + WS.OPERATORS.DYNAMIC + WS.DYNAMIC_FILTERS.ONE_OF_MY_GROUPS + WS.OPERATORS.OR + 
				this.TASK.ASSIGNMENT_GROUP + '.' + this.SYS_DICTIONARY.MANAGER + WS.OPERATORS.DYNAMIC + WS.DYNAMIC_FILTERS.ME + WS.OPERATORS.OR + 
				this.TASK.ASSIGNED_TO + '.' + this.SYS_DICTIONARY.MANAGER + WS.OPERATORS.DYNAMIC + WS.DYNAMIC_FILTERS.ME + WS.OPERATORS.END_QUERY;
		

		var isAdmin = gs.hasRole(WS.ROLES.SN_CMDB_ADMIN) || gs.hasRole(WS.ROLES.MAINT);
		if (isAdmin) {
			assignmentFilter = (this.TASK_FILTERS.ASSIGNED_TO_IS_EMPTY + WS.OPERATORS.AND + this.TASK_FILTERS.ASSIGNMENT_GROUP_IS_EMPTY) + WS.OPERATORS.END_QUERY + 
				WS.OPERATORS.NEW_QUERY + assignmentFilter;
		}
		return assignmentFilter;
	},

	getAllowEmptyFieldsValue: function(taskId) {
		var contextGr = new GlideRecord(this.TASK_EXECUTION_CONTEXT.TABLE);
		contextGr.addQuery(this.TASK_EXECUTION_CONTEXT.TASK, taskId);
		contextGr.query();
		var allowEmptyFields = true;

		if (contextGr.next()) {
			var context = JSON.parse(contextGr.getValue(this.TASK_EXECUTION_CONTEXT.CONTEXT));
			allowEmptyFields = context.hasOwnProperty("allowEmptyFields") ? context.allowEmptyFields : true;
		}
		return allowEmptyFields;
	},

	type: 'CMDBWsDMTaskAccessor',
});
