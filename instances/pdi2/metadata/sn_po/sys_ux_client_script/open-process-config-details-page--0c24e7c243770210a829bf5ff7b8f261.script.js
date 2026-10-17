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
    if (event.elementId === 'process_config_list' || event.elementId === 'content_pack_list') {
        helpers.navigate.to('process-configuration-details', {
            processId: event.payload.sys_id,
            step: 'process-details'
        }, null, true);
        return;
    }

    helpers.navigate.to('process-configuration-details', {
        processId: event.payload.context.row.key,
        step: 'process-details'
    }, null, true);
}
