function script({ api, event, helpers, imports }) {
    const policyId = api.context.props.policySysId;

    const { getPolicyModel, getPolicyFieldValidatorModel, getPolicyOptionsByType } = imports["sn_cmdb_ws.DataManagerPolicyModel"]();
    const { POLICY_FORM_VIEWS, FORM_ICONS, getFormViewStateMap, getHideBackButton, getHideContinueButton, focusElement } = imports["sn_cmdb_ws.DataManagerStateUtil"]();
    const { cloneDeep } = imports["sn_cmdb_ws.CmdbWsCloneUtil"]();

    const userSession = api.context.session.user;
    const stateMap = getFormViewStateMap();
    const policyModel = getPolicyModel(userSession);
    const validatorModel = getPolicyFieldValidatorModel();
    const policyOptionsByType = getPolicyOptionsByType();

    api.setState("policySysId", policyId ? policyId : "-1");
    api.setState("encodedQueryDisplayValue", "");
    api.setState("hideDataFilterList", true);
    api.setState("hideEnforcedCondition", false);
    api.setState("policyUpdated", "");
    api.setState("policyData", cloneDeep(policyModel));
    api.setState("selectedTabTitle", stateMap.general_info.label);
    api.setState("selectedTabId", POLICY_FORM_VIEWS.GENERAL_INFO);
    api.setState("selectedTabFormattedForContentTree", [[POLICY_FORM_VIEWS.GENERAL_INFO]]);
    Object.keys(stateMap).forEach(key => {
        stateMap[key].disabled = key == POLICY_FORM_VIEWS.GENERAL_INFO ? false : true;
        stateMap[key]["statuses"] = key == POLICY_FORM_VIEWS.GENERAL_INFO ? FORM_ICONS.EDITING.statuses : FORM_ICONS.LOCKED.statuses;
    });
    api.setState("formViewStateMap", cloneDeep(stateMap));
    api.setState("policyOptionsByType", policyOptionsByType);
    api.setState("validatorModel", validatorModel);
    api.setState("isPolicyPublished", false);
    api.setState("selectedPolicyTypeSysId", "-1");
    api.setState("policyTypeListItems", cloneDeep([{
        "label": "",
        "id": "-1"
    }]));
    api.setState("isBackButtonHidden", getHideBackButton(POLICY_FORM_VIEWS.GENERAL_INFO));
    api.setState("isContinueButtonHidden", getHideContinueButton(POLICY_FORM_VIEWS.GENERAL_INFO));
    api.setState("isEditMode", api.context.props.policySysId + "" !== "-1");
    focusElement({api, helpers}, stateMap.general_info.focusElementId, POLICY_FORM_VIEWS.GENERAL_INFO);
    api.data.get_policy_types.refresh();
}
