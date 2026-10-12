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
    api.data.get_smart_detection_eligible_cis_info.refresh();
    api.setState('renderSmartDetectionScreen', true);
    api.setState('refreshSmartDetectionList', { refreshList: Date.now() });
}
