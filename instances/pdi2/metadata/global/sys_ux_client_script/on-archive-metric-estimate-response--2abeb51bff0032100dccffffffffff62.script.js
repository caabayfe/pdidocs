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
    const {
        STATE,
        ARCHIVE_METRIC_ESTIMATE_TYPE
    } = imports["global.DMClientConstants"]();
    const {
        recordEstimate,
        estimateDate,
        estimateType,
        destroyRuleId
    } = event.payload.data && event.payload.data.output;
    const {
        deepClone
    } = imports["global.DMClientScriptUtils"]();
    const {
        UI_MESSAGE,
        getFormattedMessage
    } = imports["global.DMClientMessageHandler"]();

    let estimates = deepClone(api.state[STATE.ARCHIVE_METRIC_ESTIMATE_VALUES]);
    if (estimateType == ARCHIVE_METRIC_ESTIMATE_TYPE.ARCHIVE_ESTIMATE) {
        estimates.archiveEstimate.recordEstimate = recordEstimate;
        estimates.archiveEstimate.estimateDate = estimateDate;
        estimates.archiveEstimate.alert.loader = false;
        estimates.archiveEstimate.alert.message = await getFormattedMessage(api, helpers, UI_MESSAGE.ARCHIVE_ESTIMATE_COMPLETED);
    } else if (estimateType == ARCHIVE_METRIC_ESTIMATE_TYPE.ARCHIVE_DESTORY_ESTIMATE) {
        estimates.archiveDestroyEstimate.recordEstimate = recordEstimate;
        estimates.archiveDestroyEstimate.estimateDate = estimateDate;
        estimates.archiveDestroyEstimate.alert.loader = false;
        estimates.archiveDestroyEstimate.alert.message = await getFormattedMessage(api, helpers, UI_MESSAGE.ARCHIVE_DESTROY_ESTIMATE_COMPLETED);

        if (destroyRuleId) {
            let ruleData = deepClone(api.state[STATE.RULE_DATA]);
            ruleData.archive.destroy_rule = destroyRuleId;
            api.setState(STATE.RULE_DATA, ruleData);
        }
    }
    api.setState(STATE.ARCHIVE_METRIC_ESTIMATE_VALUES, estimates);
}
