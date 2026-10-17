/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const sowRpUtils = imports['sn_sow_record.SOWRecordPageUtilsSNC']();
    const metrics = sowRpUtils.getMetricsToTrack(api);
    for (let i = 0; i < metrics.length; i++) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', metrics[i]);
    }
}
