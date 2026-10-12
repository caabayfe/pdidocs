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
    helpers.timing.setTimeout(()=>{
    if (api.state.header_data.primary) {
        helpers.screen.updateStatus({
            title: api.state.header_data.primary
        });
    }
    }, 500);
}
