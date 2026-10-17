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
    var handleRecordPagePropagateAction = imports['sn_sow_record.HandleRecordPagePropagateAction']();
    handleRecordPagePropagateAction.processParams(api, event, helpers);
}
