function transform(input) {
    var DM = new CMDBWsDMConstants();
    var util = new CMDBWorkspaceUtil();

    var wrapperFunction = function() {
        var policySysId;
		if (input.policySysId  + "" == "-1" || !input.policySysId) {
			return {
				"policyData": {}
			};
		}
        // check if this sysId is the runtime attribute table sys_id otherwise assum it's policy sys_id
        gr = new GlideRecord(DM.RUNTIME_ATTRIBUTE.TABLE);
        if (gr.get(input.policySysId)) {
            policySysId = gr.policy.sys_id + "";
        } else {
            policySysId = input.policySysId;
        }

        var proxy = new CMDBWsDMPolicyUIProxy();
        var policyData = proxy.getPolicyInfo(policySysId);

        // populate label data for policy type
        var gr = new GlideRecord("cmdb_policy_type");
        gr.get(policyData.general_info.cmdb_policy_type + "");
        policyData.policyTypeLabel = gr.getDisplayValue("name");

        // populate label for assignment
        var unknownAssignment = sn_i18n.Message.getMessage("sn_cmdb_ws", "Unknown Assignment");
        var fieldLabels;
        // workaround for a legacy bug. When users select specific group in the legacy angular data manager
        // the task assignment type is populated with user_group_field instead of specific_user_group
        if (policyData.assignment.task_assignment_type === DM.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_GROUP || policyData.assignment.user_group) {
            policyData.userGroupDisplayValue = proxy.getRecordLabel(
                policyData.assignment.user_group, "sys_user_group", unknownAssignment
            );
        } else if (policyData.assignment.task_assignment_type === DM.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.SPECIFIC_USER) {
            policyData.userDisplayValue = proxy.getRecordLabel(
                policyData.assignment.user, "sys_user", unknownAssignment
            );
        } else if (policyData.assignment.task_assignment_type === DM.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD) {
            if (gs.nil(policyData.assignment.task_management_group)) {
				//Blank records come back with default value for assignment type but no other assignment info,
				//this is a new record and should have a blank task_assignment_type in its policyData
				policyData.assignment.task_assignment_type = '';
			} else {
                gr = new GlideRecord("sys_dictionary");
                if (!gr.get(policyData.assignment.task_management_group)) {
                    policyData.taskGroupDisplayValue = unknownAssignment;
                } else {
                    policyData.taskGroupDisplayValue = gr.getDisplayValue("column_label") || unknownAssignment;
                }
                policyData.assignment.empty_assignment_label = proxy.getRecordLabel(
                    policyData.assignment.empty_assignment_value, "sys_user_group"
                );
            }
        } else if (policyData.assignment.task_assignment_type === DM.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.USER_FIELD && !gs.nil(policyData.assignment.task_management_user)) {
            gr = new GlideRecord("sys_dictionary");
            if (!gr.get(policyData.assignment.task_management_user)) {
                policyData.taskUserDisplayValue = unknownAssignment;
            } else {
                policyData.taskUserDisplayValue = gr.getDisplayValue("column_label") || unknownAssignment;
            }
            policyData.assignment.empty_assignment_label = proxy.getRecordLabel(
                policyData.assignment.empty_assignment_value, "sys_user"
            );
        } else if (policyData.assignment.task_assignment_type === DM.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.GROUP_FIELD && !gs.nil(policyData.assignment.task_management_field_path)) {
            fieldLabels = util.getDotWalkFieldLabels(policyData.data_filter.table, policyData.assignment.task_management_field_path);
            policyData.taskGroupDisplayValue = fieldLabels.length > 0 ? fieldLabels.join(' > ') : unknownAssignment;
            policyData.assignment.empty_assignment_label = proxy.getRecordLabel(
                policyData.assignment.empty_assignment_value, "sys_user_group"
            );
        } else if (policyData.assignment.task_assignment_type === DM.POLICY.TASK_ASSIGNMENT_TYPE_OPTIONS.USER_FIELD && !gs.nil(policyData.assignment.task_management_field_path)) {
            fieldLabels = util.getDotWalkFieldLabels(policyData.data_filter.table, policyData.assignment.task_management_field_path);
            policyData.taskUserDisplayValue = fieldLabels.length > 0 ? fieldLabels.join(' > ') : unknownAssignment;
            policyData.assignment.empty_assignment_label = proxy.getRecordLabel(
                policyData.assignment.empty_assignment_value, "sys_user"
            );
        } else {
            policyData.unknownAssignment = unknownAssignment;
        }

        // populate label for subflow
        if (policyData.options.subflow) {
            gr = new GlideRecord("sys_hub_flow");
            gr.get(policyData.options.subflow + "");
            policyData.subflowDisplayValue = gr.getDisplayValue("name");
        }

        // populate label for created on date and table
        gr = new GlideRecord("cmdb_data_management_policy");
        gr.get(policySysId);
        policyData.sys_created_on = gr.sys_created_on + "";

        // populate label for schedule
        var scheduleUtil = new CMDBWsDMScheduleDisplayUtil();
        var scheduleLabel = scheduleUtil.getScheduleLabel(policyData.schedule);
        if (!scheduleLabel && policyData.schedule.run_type) {
            policyData.scheduleDisplayValue =
                sn_i18n.Message.getMessage("sn_cmdb_ws", "Unknown Schedule");
        } else {
            policyData.scheduleDisplayValue = scheduleLabel;
        }

		// fix for missing schedule UI values if scheduled job hasn't been created yet
		if (policyData.schedule) {
			if (gs.nil(policyData.schedule.run_user)) {
				var runtimeAttributeGr = new GlideRecord(DM.RUNTIME_ATTRIBUTE.TABLE);
				runtimeAttributeGr.addQuery(DM.RUNTIME_ATTRIBUTE.POLICY, policySysId);
				runtimeAttributeGr.query();
				if (runtimeAttributeGr.next()) {
					policyData.schedule.run_user = runtimeAttributeGr.getValue(DM.RUNTIME_ATTRIBUTE.RUN_AS);
					}
			}

			if(gs.nil(policyData.schedule.run_type)) {
				//set daily schedule as default
				policyData.schedule.run_type = DM.POLICY_SCHEDULED_JOB.RUN_TYPE_VALUES.DAILY;
			}
		}

        // update the updated_on flag for the client display
        var gdt = new GlideDateTime(policyData.updated_on);
        policyData.policyUpdated = gs.getMessage("Last saved: {0}", gdt.getDisplayValue());

        return {
            "policyData": policyData
        };
    };
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get data manager policy details", wrapperFunction);
}
