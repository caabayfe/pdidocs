/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { STATE, RULE_TYPE, MESSAGE_TYPE } = imports["global.DMClientConstants"]();
    const { getFormattedMessage, UI_MESSAGE, pushMessage } = imports["global.DMClientMessageHandler"]();
    const { tableName } = api.context.props;
    const { isEditFlow } = api.state;

    //Set the default rule type
    const { tableMetadata } = api.data.dmc_rule_app_context.output;
    const { ruleEligibility } = tableMetadata;
    var selectedRuleType;
    Object.keys(ruleEligibility).some(key => {
        if (ruleEligibility[key]) {
            selectedRuleType = key;
            return true;
        }
    });

    if (!selectedRuleType) {
        api.setState("isTableInvalid", true);
        pushMessage(api, helpers, {
            type: MESSAGE_TYPE.CRITICAL,
            message: "Invalid table selected"
        });
        return;
    }

    if(!isEditFlow) {
        api.setState("selectedRuleType", selectedRuleType);
        api.setState("selectedTabId", selectedRuleType + ".basic_information");
    }
    //Set the scope state
    const { currentScope } = api.data.dmc_rule_app_context.output;
    const tableScope = tableMetadata.scope;
    api.setState(STATE.CURRENT_SCOPE, currentScope);
    api.setState(STATE.TABLE_SCOPE, tableScope);

    if (selectedRuleType && selectedRuleType != RULE_TYPE.ONETIME_DELETE && currentScope.sysID != tableScope.sysID) {
        let bareMessage = isEditFlow ? UI_MESSAGE.SCOPE_MISMATCH_FOR_EDIT : UI_MESSAGE.SCOPE_MISMATCH_FOR_CREATE;
        const message = await getFormattedMessage(api, helpers, bareMessage, tableScope.name, currentScope.name);
        pushMessage(api, helpers, {
            type: MESSAGE_TYPE.INFO,
            message: message
        });
    }

    if(tableMetadata && tableMetadata.policy && !tableMetadata.policy.active) {
        const dmPolicyAlert = deepClone(api.state[STATE.DM_POLICY_ALERT]);
        if( selectedRuleType && selectedRuleType == RULE_TYPE.ONETIME_DELETE ) {
            dmPolicyAlert.hide = true;
        } else {
            dmPolicyAlert.hide = false;
        }
        api.setState(STATE.DM_POLICY_ALERT, dmPolicyAlert);
    }
    //Set Table Metadata
    api.setState("tableMetadata", deepClone(tableMetadata));
}
