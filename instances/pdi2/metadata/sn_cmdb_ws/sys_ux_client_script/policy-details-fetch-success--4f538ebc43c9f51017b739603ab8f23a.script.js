async function script({api, event, helpers, imports }) {
    const {
        DM_POLICY_TYPE_IDS,
        DM_POLICY_STATUS
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const { policyData } = api.data.getDataManagerPolicyDetails.output;
    const policyType = policyData.general_info.cmdb_policy_type;
    const isDeactivated = policyData.status === DM_POLICY_STATUS.INACTIVE;
    const hideActivatePolicyButton = !policyData.status || policyData.status == DM_POLICY_STATUS.DRAFT || policyData.status == DM_POLICY_STATUS.EVALUATION_FAILED;

    // populate the header horizontal label value stacked
    const headerHorizontalLabelValue = [
        {
            "label": await helpers.translate("Policy Type"),
            "value": {
                "type": "string",
                "value": policyData.policyTypeLabel
            }
        },
        {
            "label": await helpers.translate("Status"),
            "value": {
                "type": "string",
                "value": policyData.status
            }
        }
    ];

    // populate assignment data. may support alternate user/group combinations in the future (like Teams) so this should be updated to accomodate
    const assignmentLabel = await helpers.translate("Assignment");
    if (policyData.assignment.user_group) {
        headerHorizontalLabelValue.push({
            "label": assignmentLabel,
            "value" : {
                "type": "text-link",
                "label": policyData.userGroupDisplayValue,
                "href": '/nav_to.do?uri=/sys_user_group.do?sys_id=' + policyData.assignment.user_group,
                "underlined": false,
                "opensWindow": true
            }
        });
    } else if (policyData.assignment.user) {
        headerHorizontalLabelValue.push({
            "label": assignmentLabel,
            "value" : {
                "type": "text-link",
                "label": policyData.userDisplayValue,
                "href": '/nav_to.do?uri=/sys_user.do?sys_id=' + policyData.assignment.user,
                "underlined": false,
                "opensWindow": true
            }
        });
    } else if (policyData.assignment.task_management_group || policyData.taskGroupDisplayValue) {
        headerHorizontalLabelValue.push({
            "label": assignmentLabel,
            "value" : {
                "type": "string",
                "value": policyData.taskGroupDisplayValue,
            }
        });
    } else if (policyData.assignment.task_management_user || policyData.taskUserDisplayValue) {
        headerHorizontalLabelValue.push({
            "label": assignmentLabel,
            "value" : {
                "type": "string",
                "value": policyData.taskUserDisplayValue,
            }
        });
    } else {
        headerHorizontalLabelValue.push({
            "label": assignmentLabel,
            "value" : {
                "type": "string",
                "value": policyData.unknownAssignment,
            }
        });
    }
    api.setState("headerHorizontalLabelValue", headerHorizontalLabelValue);

    // populate the details horizontal label value stacked
    const detailsHorizontalLabelValue = [{
        "label": await helpers.translate("Created"),
        "value": {
            "type": "string",
            "value": policyData.sys_created_on
        }
    }];

    if (Object.values(DM_POLICY_TYPE_IDS.NON_LIFECYCLE).includes(policyType)) {
        // populate attestation and certification values
        detailsHorizontalLabelValue.push({
            "label": await helpers.translate("Schedule"),
            "value": {
                "type": "string",
                "value": policyData.scheduleDisplayValue
            }
        });
        detailsHorizontalLabelValue.push({
            "label": await helpers.translate("Days to complete"),
            "value": {
                "type": "string",
                "value": policyData.options.task_due_in_days
            }
        });
    } 
    api.setState("detailsHorizontalLabelValue", detailsHorizontalLabelValue);

    const detailsVerticalLabelValue = [{
        "label": await helpers.translate("Description"),
        "value": {
            "type": "string",
            "value": policyData.general_info.description || await helpers.translate("None")
        }
    }];

    if (DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION === policyData.general_info.cmdb_policy_type) {
        // TODO: Fill in display fields and certification fields
    } else if (policyData.options.subflow) {
        detailsVerticalLabelValue.push({
            "label": await helpers.translate("Subflow"),
            "value": {
                "type": "string",
                "value": policyData.subflowDisplayValue
            }
        });
    }
    api.setState("detailsVerticalLabelValue", detailsVerticalLabelValue);
    api.setState("isDeactivated", isDeactivated);
    api.setState("hideActivatePolicyButton", hideActivatePolicyButton);
    api.setState("deactivateButtonTitle", isDeactivated ? 
        await helpers.translate("Activate Policy") : 
        await helpers.translate("Deactivate Policy"));
}
