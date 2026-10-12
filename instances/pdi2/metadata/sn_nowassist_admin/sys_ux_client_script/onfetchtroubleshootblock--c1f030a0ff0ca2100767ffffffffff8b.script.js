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
    var output = event.payload?.data?.output;
    api.setState('troubleshootErrorOccured', output?.troubleshootErrorOccured);
    api.setState('showTroubleshootLoading', output?.showTroubleshootLoading);
    api.setState('showTroubleshootResult', output?.showTroubleshootResult);
    api.setState('showEmptyResult', output?.showEmptyResult);
    api.setState('troubleshootResult', output?.troubleshootResult);
}
