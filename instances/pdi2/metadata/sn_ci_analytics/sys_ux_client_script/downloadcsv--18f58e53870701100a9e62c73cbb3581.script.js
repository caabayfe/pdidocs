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
    const {
        download_id
    } = event.payload.data.output;
    const external = {
        "url": "./sys_attachment.do?sys_id=" + download_id
    };
    helpers.navigate.to(undefined, undefined, undefined, undefined, undefined, undefined, external);
    api.setState("exportInProgress", false);
}
