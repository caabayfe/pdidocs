/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        STATE,
        RULE_TYPE,
        UI_ELEMENT_ID
    } = imports["global.DMClientConstants"]();
    const {
        deepClone
    } = imports["global.DMClientScriptUtils"]();
    const {
        rule
    } = api.data.load_rule_details.output;

    let ruleType = api.context.props.ruleType;
    if (!(rule && ruleType)) return;

    const ruleData = deepClone(api.state[STATE.RULE_DATA]);
    ruleData["rule_type"] = ruleType;
    ruleData[ruleType] = rule;
    api.setState(STATE.SELECTED_RULE_TYPE, ruleType);
    // If the rule type is archive, then fetch the table references for manage related records
    if (ruleType == RULE_TYPE.ARCHIVE) {
        let estimateValues = deepClone(api.state[STATE.ARCHIVE_METRIC_ESTIMATE_VALUES]);
        estimateValues.archiveEstimate.estimateDate = rule.estimate_date;
        estimateValues.archiveEstimate.recordEstimate = rule.record_estimate;
        estimateValues.archiveDestroyEstimate.estimateDate = rule.destroy_archive_estimate_date;
        estimateValues.archiveDestroyEstimate.recordEstimate = rule.destroy_archive_estimate;

        api.setState(STATE.ARCHIVE_METRIC_ESTIMATE_VALUES, estimateValues);
        // Handle retain references
        if(rule && rule.retain_references) api.setState("retainReferenceCheckBoxDisabled", true);
        api.emit('FETCH.REFERENCES', {});
    }

    if (ruleType == RULE_TYPE.ONETIME_DELETE) {
        const {
            rollback_excluded_list
        } = rule;
        if (rollback_excluded_list && rollback_excluded_list.length > 0) {
            ruleData[RULE_TYPE.ONETIME_DELETE][UI_ELEMENT_ID.RECORD_ROLLBACK] = false;
            api.setState(STATE.ROLLBACK_EXCLUDED_LIST, rollback_excluded_list);
        }
    }
    api.setState(STATE.RULE_DATA, ruleData);
}
