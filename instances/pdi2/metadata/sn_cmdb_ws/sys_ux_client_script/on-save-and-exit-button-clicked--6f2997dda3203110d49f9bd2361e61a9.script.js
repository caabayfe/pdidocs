async function script({ api, event, helpers, imports }) {
    // On save and exit button clicked
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const { validatePolicyForm } = imports["sn_cmdb_ws.DataManagerPolicyFormUtil"]();
    const { validatorModel, selectedTabId, policyData, formViewStateMap, policySysId } = api.state;
    const { POLICY_NOTIFICATION_MSG_CODES } = imports["sn_cmdb_ws.DataManagerNotificationUtil"]();
    const { DM_PAGE_TABS, DM_POLICIES_PAGE_SUBTABS, PAGE_ROUTES, DM_POLICY_STATUS, DM_POLICY_TYPE_IDS } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    let currentView;

    if (policyData.status === DM_POLICY_STATUS.PUBLISHED) {
        helpers.navigate.to(PAGE_ROUTES.DM_HOME, {}, {
            selectedTabIndex: DM_PAGE_TABS.POLICIES,
            subSelectedTabIndex: DM_POLICIES_PAGE_SUBTABS.PUBLISHED_POLICIES,
            ts: Date.now()
        }, null, null, 'current');
        return;
    }

    let allFieldsValid = await validatePolicyForm(validatorModel, selectedTabId, policyData, helpers);
    if (!allFieldsValid) {
        // update the invalid state on fields that are required
        api.setState("validatorModel", cloneDeep(validatorModel));
        return;
    }

    // If it is the options tab, validate that the retention time value is correct
    if (selectedTabId === "options") {
        let archiveForDays = parseInt(policyData[selectedTabId].archive_for_days);
        let retentionTime = parseInt(policyData[selectedTabId].retention_time);
        let timeframeSelection = policyData[selectedTabId].retention_timeframe_selection;

        if (timeframeSelection === "days") {
            if (archiveForDays !== retentionTime)
                policyData[selectedTabId].archive_for_days = retentionTime.toString();
        }
        else if (timeframeSelection === "months") {
            if (archiveForDays != (retentionTime * 30)) {
                let months = retentionTime * 30;
                policyData[selectedTabId].archive_for_days = months.toString();
            }
        }
        else if (timeframeSelection === "years") {
            if (archiveForDays != (retentionTime * 365)) {
                let years = retentionTime * 365;
                policyData[selectedTabId].archive_for_days = years.toString();
            }
        }
    }

    currentView = formViewStateMap[selectedTabId].nextView;

    // save the current view data
    if (!policySysId || policySysId == "-1") {
        api.data.dataManagerCreatePolicy.execute({
            "payload": {
                ...policyData[selectedTabId]
            }
        });
    } else {
        api.data.dataManagerUpdatePolicy.execute({
            "payload": {
                policySysId,
                "currentView": selectedTabId,
                "policyData": {
                    ...policyData
                }
            }
        });
    }

    helpers.navigate.to(PAGE_ROUTES.DM_HOME, {}, {
        showNotification: POLICY_NOTIFICATION_MSG_CODES.POLICY_SAVE_SUCCESS,
        selectedTabIndex: DM_PAGE_TABS.POLICIES,
        subSelectedTabIndex: DM_POLICIES_PAGE_SUBTABS.DRAFT_POLICIES,
        ts: Date.now()
    }, null, null, 'current');
}
