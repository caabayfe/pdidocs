function transform(input) {
	var wrapperFunction = function() {
		var DM = new CMDBWsDMConstants();
		var totalRecords = 0;
		if (!input.sys_id)
			return {};
		var gr = new GlideRecord(DM.TASK.TABLE);
		gr.get(input.sys_id);
		var taskDisplayValue = gr.getDisplayValue(DM.TASK.NUMBER);
		var assignmentGroup = {
			displayValue: gr.getDisplayValue(DM.TASK.ASSIGNMENT_GROUP),
			value: gr.getValue(DM.TASK.ASSIGNMENT_GROUP)
		};
		var assignedTo = {
			displayValue: gr.getDisplayValue(DM.TASK.ASSIGNED_TO),
			value: gr.getValue(DM.TASK.ASSIGNED_TO)
		};
		var taskState = gr.getValue(DM.TASK.STATE);
		var isTaskClosed = taskState == DM.TASK.STATE_OPTIONS.CLOSED_COMPLETE
			|| taskState == DM.TASK.STATE_OPTIONS.CLOSED_INCOMPLETE
			|| taskState == DM.TASK.STATE_OPTIONS.CLOSED_SKIPPED
			|| taskState == DM.TASK.STATE_OPTIONS.CLOSED_CANCELLED;
		var policyId = gr.getValue(DM.TASK.POLICY);
	
		var certTable = '';
		var displayFields = '';
		var certificationFields = '';
		gr = new GlideRecord(DM.TASK_EXECUTION_CONTEXT.TABLE);
		gr.addQuery(DM.TASK_EXECUTION_CONTEXT.TASK, input.sys_id);
		gr.setLimit(1);
		gr.query();
		if (gr.next()) {
			var context = gr.getValue(DM.TASK_EXECUTION_CONTEXT.CONTEXT);
			context = JSON.parse(context);
			certTable = context.table;
			displayFields = context.displayFields;
			certificationFields = context.certificationFields;
			allowFieldUpdates = gs.nil(context.allowFieldUpdates) ? true : context.allowFieldUpdates; // return true by default
		}

		if (!certTable || !displayFields || !certificationFields) {
			var errorMessage = !certTable ? sn_i18n.Message.getMessage("sn_cmdb_ws", "Certification policy does not have a table") :
				!displayFields ? sn_i18n.Message.getMessage("sn_cmdb_ws", "Certification policy does not have display fields") :
				sn_i18n.Message.getMessage("sn_cmdb_ws", "Certification policy does not have certification fields");
			throw new CMDBWsError({
				code: DM.ERROR_CODES.DM_INVALID_RECORD,
				message: errorMessage,
				action: DM.ACTIONS.DM_GET_CERT_TASK,
				source: DM.DM_ERROR_SOURCE,
				details: "Certification policy does not have a table (" + certTable + "), display fields (" + displayFields + "), or certification fields (" + certificationFields + ")",
				logError: true
			});
		}
	
		var viewName = new CMDBWsDMPolicyManager().getCertificationPolicyViewName(certTable, displayFields, certificationFields);
	
		var tabConfig = [];
		var tabConfigObj = {};
		var reviewNotCompletedMsg = gs.getMessage('Review not completed');
		var incompleteTab = {
			label: reviewNotCompletedMsg,
			fields: {
				rlQuery: 'RLQUERYsn_cmdb_ws_dm_certification_task_to_document.ci,=1^status=pending^cmdb_data_management_task=' + input.sys_id + '^ENDRLQUERY'
			}
		};
		var incompleteCount = CMDBWsDMUtil.getRowCount(DM.CERTIFICATION_TASK_TO_DOCUMENT.TABLE, 'status=pending^cmdb_data_management_task=' + input.sys_id);
		if (incompleteCount > 0) {
			incompleteTab.count = incompleteCount;
			totalRecords += parseInt(incompleteCount);
		}
		tabConfig.push(incompleteTab);
		tabConfigObj['review_not_completed'] = incompleteTab;
		var reviewCompletedMsg = gs.getMessage('Review completed');
		var completeTab = {
			label: reviewCompletedMsg,
			fields: {
				rlQuery: 'RLQUERYsn_cmdb_ws_dm_certification_task_to_document.ci,=1^status!=pending^cmdb_data_management_task=' + input.sys_id + '^ENDRLQUERY'
			}
		};
		var completeCount = CMDBWsDMUtil.getRowCount(DM.CERTIFICATION_TASK_TO_DOCUMENT.TABLE, 'status!=pending^cmdb_data_management_task=' + input.sys_id);
		if (completeCount > 0) {
			completeTab.count = completeCount;
			totalRecords += parseInt(completeCount);
		}
		tabConfig.push(completeTab);
		tabConfigObj['review_completed'] = completeTab;

		//Can current user has write access to 
		var certGr = new GlideRecord(certTable);
		var canWrite = certGr.isValid() ? certGr.canWrite() : false;
	
		return {
			assignedTo: assignedTo,
			assignmentGroup: assignmentGroup,
			certTable: certTable,
			canWrite: canWrite,
			certificationFields: certificationFields,
			displayFields: displayFields,
			isTaskClosed: isTaskClosed,
			tabConfig: tabConfig,
			tabConfigObj: tabConfigObj,
			taskDisplayValue: taskDisplayValue,
			totalRecords: totalRecords,
			viewName: viewName,
			allowFieldUpdates: allowFieldUpdates
		};
	}

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get certification task data", wrapperFunction);
}
