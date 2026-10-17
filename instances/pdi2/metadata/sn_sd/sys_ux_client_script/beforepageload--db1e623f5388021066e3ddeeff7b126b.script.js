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
    let blockcontext = api.state.blockcontext;
    //update blockcontext as per your business logic.
    api.emit('ACE_PAGE_READY', {
        blockcontext
    });
}
