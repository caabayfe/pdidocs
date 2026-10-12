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
    if (api.data.get_smart_detection_state.output) {
        const {
            ciCount,
            smartDetectionAccepted,
            smartDetectionDisabled,
            runOn,
            lastDiscovered
        } = api.data.get_smart_detection_state.output;
        api.setState('smartDetectionAccepted', smartDetectionAccepted);
        api.setState('smartDetectionCancelled', !smartDetectionAccepted);
        api.setState('smartDetectionRunOn', runOn);
        api.setState('smartDetectionCount', ciCount);
        api.setState('smartDetectionlastDiscovered', lastDiscovered);
        api.setState('smartDetectionDisabled', smartDetectionDisabled);
    }

    if (api.data.get_smart_detection_eligible_cis_info.output) {
        const {
            ciCount,
            runOn,
            lastDiscovered
        } = api.data.get_smart_detection_eligible_cis_info.output;
        api.setState('smartDetectionRunOn', runOn);
        api.setState('smartDetectionCount', ciCount);
        api.setState('smartDetectionLastDiscovered', lastDiscovered);
    }
}
