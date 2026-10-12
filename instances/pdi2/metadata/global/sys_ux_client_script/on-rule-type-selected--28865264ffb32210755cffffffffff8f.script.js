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
    const { getFormattedMessage, UI_MESSAGE, pushMessage, removeMessage } = imports["global.DMClientMessageHandler"]();
    const { currentScope } = api.data.dmc_rule_app_context.output;
    const tableScope = api.data.dmc_rule_app_context.output.tableMetadata.scope;
    const { tableName } = api.context.props;
    const selectedRuleType = event.payload.ruleType;
    const { tableMetadata, isEditFlow } = api.state;

    async function handleMessage(condition, messageObj) {
        if (condition) {
            pushMessage(api, helpers, messageObj);
        } else {
            removeMessage(api, helpers, messageObj);
        }
    }

    if (currentScope.sysID != tableScope.sysID) {
    	let bareMessage = isEditFlow ? UI_MESSAGE.SCOPE_MISMATCH_FOR_EDIT : UI_MESSAGE.SCOPE_MISMATCH_FOR_CREATE;
        const messageObj = {
            type: MESSAGE_TYPE.INFO,
            message: await getFormattedMessage(api, helpers, bareMessage, tableScope.name, currentScope.name)
        };
        await handleMessage(selectedRuleType && selectedRuleType != RULE_TYPE.ONETIME_DELETE, messageObj);
    }

    if (tableMetadata && tableMetadata.policy && !tableMetadata.policy.active) {
        const dmPolicyAlert = deepClone(api.state[STATE.DM_POLICY_ALERT]);
        if(selectedRuleType && selectedRuleType == RULE_TYPE.ONETIME_DELETE) {
            dmPolicyAlert.hide = true;
        } else {
            dmPolicyAlert.hide = false;
        }
        api.setState(STATE.DM_POLICY_ALERT, dmPolicyAlert);
    }
}
