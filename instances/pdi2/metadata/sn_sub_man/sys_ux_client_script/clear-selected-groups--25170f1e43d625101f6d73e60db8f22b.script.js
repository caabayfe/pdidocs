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
    //clear selected groups on button click
    api.setState('selectedGroupsObjArray', []);
    api.setState('allocateButtonDisable', true);
}
