async function script({ api, event, helpers, imports }) {
    // On select item set script
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const { setPolicyModelData } = imports["sn_cmdb_ws.SetPolicyModelData"]();
    const { FORM_ICONS, SCHEDULE_TYPES, SCHEDULE_IDS, getHiddenScheduleComponentsByType, POLICY_FORM_VIEWS } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { DM_POLICY_TYPE_IDS } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const { getPolicyModel } = imports["sn_cmdb_ws.DataManagerPolicyModel"]();
    
    if (!event.payload)
        return;

    const { policyData, formViewStateMap } = api.state;
    const { value, name, item } = event.payload;

    const {
        NowDateTime
    } = imports["sn_uxf.core_libraries"]();

    const userSession = api.context.session.user;
    const newPolicyData = setPolicyModelData(name, value, cloneDeep(policyData));

    const _setPolicyScheduleView = (scheduleTypeValue) => {
        // format the date
        const d = new Date();
        let month = (d.getMonth() + 1) + "";
        let day = d.getDate() + "";
        const year = d.getFullYear() + "";

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        const userDateFormat = userSession.dateFormat.toUpperCase() || "yyyy-MM-dd";
        const userTimeFormat = userSession.timeFormat || "HH:mm:ss";
        const userFormat = userDateFormat + " " + userTimeFormat;
        const dateFormat = [year, month, day].join('-');
        const dateTime = dateFormat + " 00:00:00";
        const formatted = new NowDateTime(dateTime).format(userFormat);
        const formattedTime = new NowDateTime(dateTime).format(userTimeFormat);

        const hiddenScheduleComponents = getHiddenScheduleComponentsByType(scheduleTypeValue);
        api.setState("isRunTimeHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_TIME));
        api.setState("isRunStartHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_START));
        api.setState("isRunPeriodHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_PERIOD));
        api.setState("isRunDayOfWeekHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_DAYOFWEEK));
        api.setState("isRunDayOfMonthHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_DAYOFMONTH));
        var schedule = newPolicyData.schedule;
        schedule.run_dayofmonth = "1";
        schedule.run_dayofweek = "1";
        schedule.run_period = "1";
        schedule.run_start = formatted;
        schedule.run_time = formattedTime;
        schedule.run_type = scheduleTypeValue;
    }

    if (name === 'data_filter:table' && policyData.assignment.task_assignment_type == "") {
        // blank out the encoded query, hide the list if the data filter table changes
        newPolicyData.data_filter.encoded_query = "";
        newPolicyData.data_filter.table_label = item.label || defaultTable;
        api.setState("hideDataFilterList", true);
        api.setState("hideEnforcedCondition", false);
        api.setState("encodedQueryDisplayValue", "");
        newPolicyData.options.display_fields = "";
        newPolicyData.options.certification_fields = "";
        api.setState("displayFieldOptions", []);
        api.setState("certificationFieldOptions", []);
        api.setState("displayFieldSelections", []);
        api.setState("certificationFieldSelections", []);
    } else if(name === 'data_filter:table' && policyData.assignment.task_assignment_type != ""){
        // Reset display options for the filter page
        api.setState("hideDataFilterList", true);
        api.setState("encodedQueryDisplayValue", {});
        api.setState("hideEnforcedCondition", false);

        // reset state for assignment section
        api.setState("isGroupFieldAssignmentHidden", true);
        api.setState("isUserAssignmentHidden", true);
        api.setState("isGroupAssignmentHidden", true);
        api.setState("isUserFieldAssignmentHidden", true);

        var policyType = policyData.general_info.cmdb_policy_type;
        // reset state for options section
        api.setState("isDisplayFieldsHidden", api.state.policyOptionsByType[policyType].indexOf("display_fields") === -1);
        api.setState("isCertificationFieldsHidden", api.state.policyOptionsByType[policyType].indexOf("certification_fields") === -1);
        api.setState("isAllowEmptyFieldsHidden", api.state.policyOptionsByType[policyType].indexOf("allow_empty_fields") === -1);
        api.setState("isDaysToCompleteHidden", api.state.policyOptionsByType[policyType].indexOf("task_due_in_days") === -1);
        api.setState("isInstructionsHidden", api.state.policyOptionsByType[policyType].indexOf("instructions") === -1);
        api.setState("isSubflowHidden", api.state.policyOptionsByType[policyType].indexOf("subflow") === -1);
        api.setState("isNeedsReviewHidden", api.state.policyOptionsByType[policyType].indexOf("needs_review") === -1);
        api.setState("isRetentionTimeHidden", api.state.policyOptionsByType[policyType].indexOf("archive_for_days") === -1);

        const policyModel = getPolicyModel(userSession);
        newPolicyData.options = {
            "archive_for_days": "1",
            "certification_fields": "",
            "display_fields": "",
            "instructions": "",
            "needs_review": "",
            "retention_time": "1",
            "retention_timeframe_selection": "days",
            "subflow": "",
            "task_due_in_days": "1"
        }
        newPolicyData.data_filter = {
            "encoded_query": "",
            "enforced_condition": "",
            "list_filter": "",
            "table": value || defaultTable,
            "table_label": item.label || defaultTable
        };
        newPolicyData.assignment = policyModel.assignment;
        newPolicyData.schedule = policyData.schedule;

        // reset the form nav menu
        Object.keys(formViewStateMap).forEach(key => {
            const isGeneralInfoTab = key === POLICY_FORM_VIEWS.GENERAL_INFO;
            const isDataFilterTab = key === POLICY_FORM_VIEWS.DATA_FILTER;
            formViewStateMap[key].disabled = !isGeneralInfoTab && !isDataFilterTab;
            formViewStateMap[key].statuses = isGeneralInfoTab ? FORM_ICONS.DONE.statuses : isDataFilterTab ? FORM_ICONS.EDITING.statuses : FORM_ICONS.LOCKED.statuses;
        });
        api.setState("formViewStateMap", cloneDeep(formViewStateMap));
    }

    // If it is the policy type dropdown, update the state of the options page, schedule page, subflows etc.
    // TODO: Show warning confirmation
    if (name === "general_info:cmdb_policy_type") {
        // reset table options if related entry is selected
        const isRelatedEntry = DM_POLICY_TYPE_IDS.DELETE_RELATED_ENTRY === value;
        const isCertification = DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION === value;
        const tableOptions = (isRelatedEntry ? api.data.getAllRelatedEntryTables?.relatedEntryTables : isCertification ? api.data.dataManagerGetCertificationTableOptions?.output : api.data.getAllCiClasses?.ciClassesWithSublabel) || [];
        const defaultTable = isRelatedEntry ? "cmdb_key_value" : "cmdb_ci";
        api.setState("tableOptions", tableOptions);
        api.setState("defaultTable", defaultTable);
        api.setState("selectedPolicyTable", defaultTable);
        // Reset display options for the filter page
        api.setState("hideDataFilterList", true);
        api.setState("encodedQueryDisplayValue", {});
        api.setState("hideEnforcedCondition", false);

        // reset state for assignment section
        api.setState("isGroupFieldAssignmentHidden", true);
        api.setState("isUserAssignmentHidden", true);
        api.setState("isGroupAssignmentHidden", true);
        api.setState("isUserFieldAssignmentHidden", true);

        // reset state for options section
        api.setState("isDisplayFieldsHidden", api.state.policyOptionsByType[value].indexOf("display_fields") === -1);
        api.setState("isCertificationFieldsHidden", api.state.policyOptionsByType[value].indexOf("certification_fields") === -1);
        api.setState("isAllowEmptyFieldsHidden", api.state.policyOptionsByType[value].indexOf("allow_empty_fields") === -1);
        api.setState("isDaysToCompleteHidden", api.state.policyOptionsByType[value].indexOf("task_due_in_days") === -1);
        api.setState("isInstructionsHidden", api.state.policyOptionsByType[value].indexOf("instructions") === -1);
        api.setState("isSubflowHidden", api.state.policyOptionsByType[value].indexOf("subflow") === -1);
        api.setState("isNeedsReviewHidden", api.state.policyOptionsByType[value].indexOf("needs_review") === -1);
        api.setState("isRetentionTimeHidden", api.state.policyOptionsByType[value].indexOf("archive_for_days") === -1);

        const policyModel = getPolicyModel(userSession);
        // Clear all of the options when the user changes the policy type
        newPolicyData.options = {
            "archive_for_days": "1",
            "certification_fields": "",
            "display_fields": "",
            "instructions": "",
            "needs_review": "",
            "retention_time": "1",
            "retention_timeframe_selection": "days",
            "subflow": "",
            "task_due_in_days": "1"
        }
        newPolicyData.data_filter = {
            "encoded_query": "",
            "enforced_condition": "",
            "list_filter": "",
            "table": defaultTable
        };
        newPolicyData.assignment = policyModel.assignment;
        newPolicyData.schedule = policyModel.schedule;
        if(!policyData?.schedule?.run_user) {
            newPolicyData.schedule.run_user = api.state.defaultRunAsUser;
        }

        api.data.data_manager_get_available_subflows.refresh();

        // clear the schedule data
        const isNonLifecyclePolicy = Object.values(DM_POLICY_TYPE_IDS.NON_LIFECYCLE).includes(value);
        api.setState("isNonLifecyclePolicy", isNonLifecyclePolicy);
        if (!isNonLifecyclePolicy) {
            // render the generic schedule text saying to check the schedule job table
            const policyTypeName = policyData.general_info.cmdb_policy_type_name;
            api.setState("lifecyclePolicyScheduleHeader", await helpers.translate("{0} policy schedule", policyTypeName));
            api.setState("lifecyclePolicyScheduleText", await helpers.translate("{0} policies are evaluated once a day as defined in the scheduled job.", policyTypeName));
        } else {
            _setPolicyScheduleView(SCHEDULE_TYPES.DAILY);
        }
        // reset the form nav menu
        Object.keys(formViewStateMap).forEach(key => {
            const isGeneralInfoTab = key === POLICY_FORM_VIEWS.GENERAL_INFO;
            formViewStateMap[key].disabled = !isGeneralInfoTab;
            formViewStateMap[key].statuses = isGeneralInfoTab ? FORM_ICONS.EDITING.statuses : FORM_ICONS.LOCKED.statuses;
        });
        api.setState("formViewStateMap", cloneDeep(formViewStateMap));
    }

    // If it is the assignment type dropdown, update the state of the assignment page
    else if (name === "assignment:task_assignment_type") {
        newPolicyData.assignment = {
            "task_assignment_type": newPolicyData.assignment.task_assignment_type,
            "task_management_group": "",
            "user": "",
            "user_group": "",
            "task_management_user":"",
            "task_management_field_path": "",
            "empty_assignment_action":"",
            "empty_assignment_value":""
        }
        let assignmentTypeSelection = newPolicyData.assignment.task_assignment_type;
        // Set whether to show or hide certain typeaheads
        const isUserGroupType = assignmentTypeSelection === "specific_user_group";
        const requiresSearch = isUserGroupType || assignmentTypeSelection === "specific_user";
        api.setState("isGroupFieldAssignmentHidden", assignmentTypeSelection !== "user_group_field");
        api.setState("isUserAssignmentHidden", assignmentTypeSelection !== "specific_user");
        api.setState("isGroupAssignmentHidden", !isUserGroupType);
        api.setState("isUserFieldAssignmentHidden", assignmentTypeSelection !== "user_field");

        let assignmentOptions = [{
            "id": "assignment_options",
            "label": requiresSearch ?
                await helpers.translate("The first three characters are required to search.") :
                await helpers.translate("Loading items..."),
            "children": []
        }];
        api.setState("assignmentOptions", assignmentOptions);
        // Only refresh assignment if the selection is not a type the requires typing search.
        if (!requiresSearch)
            api.data.data_manager_get_assignment_options.refresh();
    }

    // If it is the task assignment or specific user group or specific user dropdown, we need to refresh the record and task count for review
    else if (name === "assignment:task_management_group" || name === "assignment:user_group" || name === "assignment:user" || name === "assignment:task_management_user") {
        if (item && item.type && item.type == "fieldPath") {
            newPolicyData.assignment.task_management_user = "";
            newPolicyData.assignment.task_management_group = "";
            newPolicyData.assignment.task_management_field_path = value;
        } else {
            newPolicyData.assignment.task_management_field_path = "";
        }
        api.setState("refreshCounts", true);
    }

    //if it is the empty assignment action type, flush out the assignment action value
    else if (name === "assignment:empty_assignment_action") {
        newPolicyData.assignment.empty_assignment_action = value;
        if(policyData.assignment.empty_assignment_action != value)
            newPolicyData.assignment.empty_assignment_value = "";
    } else if (name === "assignment:empty_assignment_value") {
        newPolicyData.assignment.empty_assignment_value = value;
    }

    // It is the retention time dropdown, so set the archive for days value to the proper number
    else if (name === "options:retention_timeframe_selection") {
        const currentTimeframe = api.state.policyData.options.retention_timeframe_selection;
        if (api.state.policyData.options.retention_timeframe_selection === "days") {
            api.setState("maxRetentionTimeInput", "3650"); // Set the max input value to be 3650 days
            api.setState("retentionTimeTooltip", await helpers.translate("Number of days (3650 max) for retaining data."));
            let days = parseInt(newPolicyData.options.retention_time);
            if (days > 3650) {
                newPolicyData.options.retention_time = "3650";
            }
        }
        else if (api.state.policyData.options.retention_timeframe_selection === "months") {
            api.setState("maxRetentionTimeInput", "120");  // Set the max input value to be 120 months
            api.setState("retentionTimeTooltip", await helpers.translate("Number of months (120 max) for retaining data. The number that you enter is converted into days (Number x 30)."));
            let months = currentTimeframe === "days" ? parseInt(newPolicyData.options.retention_time) * 30 : parseInt(newPolicyData.options.retention_time);
            if (months > 120) {
                newPolicyData.options.retention_time = "120";
            }
        }
        else if (api.state.policyData.options.retention_timeframe_selection === "years") {
            api.setState("maxRetentionTimeInput", "10");  // Set the max input value to be 10 years
            api.setState("retentionTimeTooltip", await helpers.translate("Number of years (10 max) for retaining data. The number that you enter is converted into days (Number x 365)."));
            let years = currentTimeframe === "days" ? parseInt(newPolicyData.options.retention_time) * 365 : parseInt(newPolicyData.options.retention_time);
            if (years > 10) {
                newPolicyData.options.retention_time = "10";
            }
        }
    }

    if (name === "schedule:run_type") {
        _setPolicyScheduleView(value);
    }

    api.setState("policyData", newPolicyData);
}
