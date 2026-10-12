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
        deepClone
    } = imports["global.DMClientScriptUtils"]();

    const {
        UI_MESSAGE,
        getFormattedMessage
    } = imports["global.DMClientMessageHandler"]();

    var {
        ruleData,
    } = api.state;
    const {
        estimateType,
        archiveEstimateAlertDismissed,
        archiveEstimateConditionAlertDismissed,
        destroyArchiveEstimateAlertDismissed,
        destroyArchiveEstimateSaveAlertDismissed
    } = event.payload;


    let estimates = deepClone(api.state[STATE.ARCHIVE_METRIC_ESTIMATE_VALUES]);

    if (archiveEstimateAlertDismissed) {
        estimates.archiveEstimate.alert.hide = true;
        api.setState(STATE.ARCHIVE_METRIC_ESTIMATE_VALUES, estimates);
        return;
    }

    if (archiveEstimateConditionAlertDismissed) {
        estimates.archiveEstimate.alert.archiveEstimateConditionAlertDismissed = true;
        api.setState(STATE.ARCHIVE_METRIC_ESTIMATE_VALUES, estimates);
        return;
    }

    if (destroyArchiveEstimateAlertDismissed) {
        estimates.archiveDestroyEstimate.alert.hide = true;
        api.setState(STATE.ARCHIVE_METRIC_ESTIMATE_VALUES, estimates);
        return;
    }

    if (destroyArchiveEstimateSaveAlertDismissed) {
        estimates.archiveDestroyEstimate.alert.destroytArchiveEstimateSaveAlertDismissed = true;
        api.setState(STATE.ARCHIVE_METRIC_ESTIMATE_VALUES, estimates);
        return;
    }

    if (estimateType == ARCHIVE_METRIC_ESTIMATE_TYPE.ARCHIVE_ESTIMATE) {
        estimates.archiveEstimate.alert.hide = false;
        estimates.archiveEstimate.alert.loader = true;
        estimates.archiveEstimate.alert.message = await getFormattedMessage(api, helpers, UI_MESSAGE.ARCHIVE_ESTIMATE_IN_PROGRESS);
    } else if (estimateType == ARCHIVE_METRIC_ESTIMATE_TYPE.ARCHIVE_DESTORY_ESTIMATE) {
        estimates.archiveDestroyEstimate.alert.hide = false;
        estimates.archiveDestroyEstimate.alert.loader = true;
        estimates.archiveDestroyEstimate.alert.message = await getFormattedMessage(api, helpers, UI_MESSAGE.ARCHIVE_DESTORY_ESTIMATE_IN_PROGRESS);
    }

    api.setState(STATE.ARCHIVE_METRIC_ESTIMATE_VALUES, estimates);

    var paylodObj = {
        dmRule: ruleData,
        estimateType: estimateType
    };
    api.data.archive_metric_estimate.execute(paylodObj);
}
