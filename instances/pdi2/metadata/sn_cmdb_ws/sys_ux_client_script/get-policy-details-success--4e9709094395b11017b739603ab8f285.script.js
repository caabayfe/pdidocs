async function script({ api, event, helpers, imports }) {
    // handle policy form details fetch success
    const { policyData } = api.data.getDataManagerPolicyDetails.output;
    if (Object.keys(policyData).length === 0)
        return;

    const { DM_POLICY_STATUS, DM_POLICY_TYPE_IDS } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const { validatePolicyForm } = imports["sn_cmdb_ws.DataManagerPolicyFormUtil"]();
    const {
        POLICY_FORM_VIEWS,
        SCHEDULE_IDS,
        SCHEDULE_TYPES,
        FORM_ICONS,
        getHideBackButton,
        getHideContinueButton,
        getHiddenScheduleComponentsByType,
        focusElement
    } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { cloneDeep } = imports["sn_cmdb_ws.CmdbWsCloneUtil"]();
    const { getPolicyModel } = imports["sn_cmdb_ws.DataManagerPolicyModel"]();
    const {
        INFO_NOTIFICATION_PROPS,
        showNotificationWithAutoClose
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
    const { POLICY_NOTIFICATION_MSG_CODES, getNotificationMsg } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();
    const { formViewStateMap, validatorModel } = api.state;
    const policyType = policyData.general_info.cmdb_policy_type;
    let isDataFilterView = false;
    let isScheduleView = false;

    const userSession = api.context.session.user;

    /**  BEGIN internal functions */

    const _resetFieldsAndSetData = () => {
        const policyModel = getPolicyModel(userSession);
        // the backend will send default values for certain views, reset these to appropriate display values
        if (!policyData.data_filter || Object.keys(policyData.data_filter).length === 0 || policyData.data_filter.encoded_query === "sys_idISNOTEMPTY") {
            policyData.data_filter = policyModel.data_filter;
            isDataFilterView = true;
        }
        if (!policyData.assignment || Object.keys(policyData.assignment).length === 0 || Object.values(policyData.assignment).every(val => !val || val === "user_group_field")) {
            policyData.assignment = policyModel.assignment;
        }
        if (!policyData.options || Object.keys(policyData.options).length === 0 || Object.values(policyData.options).some(val => val === null)) {
            policyData.options = policyModel.options;
        }
        if (!policyData.schedule || Object.keys(policyData.schedule).length === 0 || Object.values(policyData.schedule).every(val => val === null)) {
            policyData.schedule = policyModel.schedule;
            isScheduleView = true;
        }
        if (!policyData.schedule.run_time) {
            policyData.schedule.run_time = policyModel.schedule.run_time;
        }
        api.setState("policyData", cloneDeep(policyData));
    }

    const _setGeneralInfo = async () => {
        api.setState("isPolicyPublished", policyData.status === DM_POLICY_STATUS.PUBLISHED);
        api.setState("selectedPolicyTypeSysId", policyType);
    }
    const _setPolicyFilterOptions = async () => {
        const tableOptions = [{'id': -1, 'label': await helpers.translate("Search for a policy table (3 characters minimum)")}];
        if (policyData.data_filter.table) {
            tableOptions.push({'id': policyData.data_filter.table, 'label': policyData.data_filter.table_label});
        }
        api.setState("selectedPolicyTable", tableOptions[tableOptions.length - 1]?.id);
        api.setState("tableOptions", tableOptions);
        api.setState("defaultTable", tableOptions[0]?.id);
    }

    const _setPolicyOptions = async () => {
        // set the subflow and options data
        api.setState("isDisplayFieldsHidden", api.state.policyOptionsByType[policyType].indexOf("display_fields") === -1);
        api.setState("isCertificationFieldsHidden", api.state.policyOptionsByType[policyType].indexOf("certification_fields") === -1);
        api.setState("isAllowEmptyFieldsHidden", api.state.policyOptionsByType[policyType].indexOf("allow_empty_fields") === -1);
        api.setState("isAllowFieldUpdatesHidden", api.state.policyOptionsByType[policyType].indexOf("allow_field_updates") === -1);
        api.setState("isDaysToCompleteHidden", api.state.policyOptionsByType[policyType].indexOf("task_due_in_days") === -1);
        api.setState("isInstructionsHidden", api.state.policyOptionsByType[policyType].indexOf("instructions") === -1);
        api.setState("isSubflowHidden", api.state.policyOptionsByType[policyType].indexOf("subflow") === -1);
        api.setState("isNeedsReviewHidden", api.state.policyOptionsByType[policyType].indexOf("needs_review") === -1);
        api.setState("isRetentionTimeHidden", api.state.policyOptionsByType[policyType].indexOf("archive_for_days") === -1);
        api.setState("allowFieldUpdatesHelperText", await helpers.translate("When checked, field values can be updated while reviewing records for certification tasks."));
        api.setState("allowEmptyFieldsHelperText", await helpers.translate("When checked, records with empty field values can be certified."));
        api.data.data_manager_get_available_subflows.refresh();

        // Set the retention time if archive for days exists
        if (policyData.options.archive_for_days) {
            let archiveForDays = parseInt(policyData.options.archive_for_days);
            let isYears = archiveForDays % 365 === 0;
            let isMonths = archiveForDays % 30 === 0;

            if (isYears) {
                let years = archiveForDays / 365;
                policyData.options.retention_time = years.toString();
                policyData.options.retention_timeframe_selection = "years";
                api.setState("maxRetentionTimeInput", "10");  // Set the max input value to be 10 years
                api.setState("retentionTimeTooltip", await helpers.translate("Number of years (10 max) for retaining data. The number that you enter is converted into days (Number x 365)."));
            }
            else if (isMonths) {
                let months = archiveForDays / 30;
                policyData.options.retention_time = months.toString();
                policyData.options.retention_timeframe_selection = "months";
                api.setState("maxRetentionTimeInput", "120");  // Set the max input value to be 120 months
                api.setState("retentionTimeTooltip", await helpers.translate("Number of months (120 max) for retaining data. The number that you enter is converted into days (Number x 30)."));
            }
            else {
                policyData.options.retention_time = archiveForDays.toString();
                policyData.options.retention_timeframe_selection = "days";
                api.setState("maxRetentionTimeInput", "3650");  // Set the max input value to be 3650 days
                api.setState("retentionTimeTooltip", await helpers.translate("Number of days (3650 max) for retaining data."));
            }
        }
    };

    const _setPolicyAssignment = async () => {
        let assignmentTypeSelection = policyData.assignment.task_assignment_type;
        // Set whether to show or hide certain typeaheads
        const isUserGroupType = assignmentTypeSelection === "specific_user_group";
        const requiresSearch = isUserGroupType || assignmentTypeSelection === "specific_user";
        api.setState("isGroupFieldAssignmentHidden", assignmentTypeSelection !== "user_group_field");
        api.setState("isUserAssignmentHidden", assignmentTypeSelection !== "specific_user");
        api.setState("isGroupAssignmentHidden", !isUserGroupType);
        api.setState("isUserFieldAssignmentHidden", assignmentTypeSelection !== "user_field")
        let assignmentOptions = [{
            "id": "assignment_options",
            "label": requiresSearch ?
                await helpers.translate("The first three characters are required to search.") :
                await helpers.translate("Loading items..."),
            "children": []
        }];
        api.setState("assignmentOptions", assignmentOptions);
        // If a user group, on load only fetch the available option for that group
        api.data.data_manager_get_assignment_options.refresh();
    };

    const _setPolicySchedule = async () => {

        // first show/hide the policy schedule choices if it is a non-lifecycle policy
        const isNonLifecyclePolicy = Object.values(DM_POLICY_TYPE_IDS.NON_LIFECYCLE).includes(policyType);
        api.data.dataManagerGetJobRunners.refresh();
        api.setState("isNonLifecyclePolicy", isNonLifecyclePolicy);
        if (!isNonLifecyclePolicy) {
            // render the generic schedule text saying to check the schedule job table
            const policyTypeName = policyData.general_info.cmdb_policy_type_name;
            api.setState("lifecyclePolicyScheduleHeader", await helpers.translate("{0} policy schedule", policyTypeName));
            api.setState("lifecyclePolicyScheduleText", await helpers.translate("{0} policies are evaluated once a day as defined in the scheduled job.", policyTypeName));
            // lifecycle policies do not have a schedule, so do not block navigation
            isScheduleView = false;
        } else {
            const hiddenScheduleComponents = getHiddenScheduleComponentsByType(policyData.schedule[SCHEDULE_IDS.RUN_TYPE]);
            // the schedule was edited outside of the form or couldn't be read
            if (!hiddenScheduleComponents)
                return;

            api.setState("isRunTimeHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_TIME));
            api.setState("isRunStartHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_START));
            api.setState("isRunPeriodHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_PERIOD));
            api.setState("isRunDayOfWeekHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_DAYOFWEEK));
            api.setState("isRunDayOfMonthHidden", hiddenScheduleComponents.includes(SCHEDULE_IDS.RUN_DAYOFMONTH));

            // convert the run_period value into a number of days. The format is "## Days"
            if (policyData.schedule[SCHEDULE_IDS.RUN_TYPE] === SCHEDULE_TYPES.PERIODICALLY) {
                const runPeriod = policyData.schedule[SCHEDULE_IDS.RUN_PERIOD_DISPLAY] || "0 Days";
                const runArray = runPeriod.split(" ");
                if (runArray.length > 1 && parseInt(runArray[0])) {
                    policyData.schedule[SCHEDULE_IDS.RUN_PERIOD] = runArray[0];
                }
            }
        }
    };

    const _fetchDataCertificationSelectedColumns = () => {
      api.data.get_certification_selected_fields_lists.execute({
        table: policyData.data_filter.table || api.state.defaultTable,
        policyId: policyData.policyId,
      });
    };

    const _fetchDataCertificationDuplicatePolicies = () => {
        api.data.get_data_certification_duplicate_policies.execute({
            policyId : policyData.policyId
        });
    };

    const _fetchDataFilter = () => {
        api.data.getDataFilterEncodedQuery.execute({
            "table": policyData.data_filter.table || api.state.defaultTable,
            "encodedQuery": policyData.data_filter.encoded_query,
            "policyTypeId": policyType
        });
        api.setState("hideDataFilterList", false);
    };

    const _fetchDataFilterAndReview = () => {
        // get the review data and card counts for review as long as the assignment data is populated
        if (policyData.assignment && Object.keys(policyData.assignment).length !== 0 &&
            !Object.values(policyData.assignment).every(val => !val || val === "user_group_field")) {
            api.data.get_data_manager_policy_review_info.execute({
                "policySysId": policyData.policyId
            });
        }
        _fetchDataFilter();
    };

    const _setContentTreeState = (endItem) => {
        // set completed states to green check and disabled = false
        let currentItem = POLICY_FORM_VIEWS.GENERAL_INFO;
        while (currentItem != endItem) {
            formViewStateMap[currentItem].disabled = false;
            formViewStateMap[currentItem]["statuses"] = FORM_ICONS.DONE.statuses;
            currentItem = formViewStateMap[currentItem].nextView;
            if (!currentItem)
                break;
        }
        if (currentItem) {
            // set the needed information view to incomplete state
            formViewStateMap[currentItem].disabled = false;
            formViewStateMap[currentItem]["statuses"] = policyData.status === DM_POLICY_STATUS.PUBLISHED ? FORM_ICONS.DONE.statuses : FORM_ICONS.EDITING.statuses;
        }
        return formViewStateMap
    }

    const _showReadOnlyNotification = async () => {
        const notificationId = 'infoId' + policyData.policyId;
        let notifications = [{
            ...INFO_NOTIFICATION_PROPS,
            id: notificationId,
            content: await getNotificationMsg(helpers, POLICY_NOTIFICATION_MSG_CODES.PUBLISH_POLICY_READ_ONLY)
        }];
        showNotificationWithAutoClose({ api, helpers }, notifications);
    }

    const _setPolicyDataAndViewState = async () => {
        _setGeneralInfo();
        _setPolicyFilterOptions();

        api.setState("policyData", cloneDeep(policyData));
        api.setState("policySysId", policyData.policyId);
        api.setState("policyUpdated", policyData.policyUpdated);
    };

    /** END internal functions */

    const defaultTable = policyType === DM_POLICY_TYPE_IDS.DELETE_RELATED_ENTRY ? 'cmdb_key_value' : 'cmdb_ci';

    if(policyType === DM_POLICY_TYPE_IDS.NON_LIFECYCLE
.CERTIFICATION) {
      _fetchDataCertificationSelectedColumns();
    }

    if (!api.state.isEditMode) {
        // on policy create don't set any additional fields. Clear out required data from backend.
        _resetFieldsAndSetData();
        api.setState("isEditMode", true);
        return;
    }

    _resetFieldsAndSetData();
    await _setPolicyOptions();
    _setPolicySchedule();

    if (policyData.status === DM_POLICY_STATUS.INACTIVE || policyData.status === DM_POLICY_STATUS.EVALUATION_FAILED) {
        // these need to be re-run and published so just leave user at general-info
        _setPolicyDataAndViewState();
        _fetchDataFilterAndReview();
        _setPolicyAssignment();
        return;
    }

    _setPolicyDataAndViewState();
    let item = "";
    if (policyData.status === DM_POLICY_STATUS.PUBLISHED) {
        item = POLICY_FORM_VIEWS.GENERAL_INFO;
        _fetchDataFilter();
        _setPolicyAssignment();
        _showReadOnlyNotification();
    } else {
        // policy is in DRAFT state
        if (isDataFilterView) {
            item = POLICY_FORM_VIEWS.DATA_FILTER;
            policyData.data_filter.encoded_query = "";
        } else if (!policyData.assignment.task_management_group && !policyData.assignment.user && !policyData.assignment.user_group && !policyData.assignment.task_management_user && !policyData.assignment.task_management_field_path) {
             if (policyData.data_filter.table === defaultTable && policyData.data_filter.encoded_query === '') {
                  item = POLICY_FORM_VIEWS.DATA_FILTER;
             } else {
                  item = POLICY_FORM_VIEWS.ASSIGNMENT;
                 policyData.assignment.task_assignment_type = "";
                _fetchDataFilterAndReview();
          }
        } else if (!await validatePolicyForm(validatorModel, POLICY_FORM_VIEWS.OPTIONS, policyData, helpers)) {
            item = POLICY_FORM_VIEWS.OPTIONS;
            _fetchDataFilterAndReview();
        } else if (isScheduleView) {
            item = POLICY_FORM_VIEWS.SCHEDULE;
            _fetchDataFilterAndReview();
        } else {
            item = POLICY_FORM_VIEWS.REVIEW;
            _fetchDataFilterAndReview();
            if(policyType === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION){
                _fetchDataCertificationDuplicatePolicies();
            }
        }
        _setPolicyAssignment();
    }

    
    if (policyData.status === DM_POLICY_STATUS.PUBLISHED) {
        _setContentTreeState(POLICY_FORM_VIEWS.REVIEW);
    } else {
        _setContentTreeState(item);
    }

    api.setState("policyData", cloneDeep(policyData));
    api.setState("policySysId", policyData.policyId);
    api.setState("policyUpdated", policyData.policyUpdated);

    var policyRunAsUser = policyData.schedule?.run_user;
    if(!api.state.originalRunAsUser && policyRunAsUser) {
        api.setState("originalRunAsUser", policyRunAsUser.toString());
    }

    Object.keys(formViewStateMap).forEach(key => formViewStateMap[key].isHidden = item !== key);
    api.setState("formViewStateMap", cloneDeep(formViewStateMap));
    api.setState("selectedTabFormattedForContentTree", [[item]]);
    api.setState("selectedTabId", item);
    api.setState("selectedTabTitle", formViewStateMap[item].label);
    api.setState("isBackButtonHidden", getHideBackButton(item));
    api.setState("isContinueButtonHidden", getHideContinueButton(item));
    focusElement({api, helpers}, formViewStateMap[item].focusElementId, item, policyData.general_info.cmdb_policy_type);
}
