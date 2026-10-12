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
    if (event.elementId == "full_mine_container") {
        api.setState('fullMine', true);
        api.setState('sampleMine', false);
    } else {
        api.setState('sampleMine', true);
        api.setState('fullMine', false);
    }
}
