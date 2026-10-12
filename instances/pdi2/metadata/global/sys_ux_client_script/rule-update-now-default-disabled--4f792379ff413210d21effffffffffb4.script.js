/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    if (api.context.props.ruleType !== "ONE_TIME_DELETE") {
        return false;
    }

    const ruleDetails = api.data.load_rule_details_child.output?.rule || {};
    if(!ruleDetails || !ruleDetails.state) return false;
    const state = ruleDetails.state;
    const executeEnabled = ["new", "scheduled"].includes(state);
    if (!executeEnabled) return true;
    return api.state["executeOTDDisabled"];
}
