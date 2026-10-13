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
    if (!event || !event.payload || !event.payload.table || !event.payload.sysId || !event.payload.confId)
        return;
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'viewport_vnk',
        route: 'conference-participants-snc',
        fields: {
            table: event.payload.table,
            sysId: event.payload.sysId,
            confId: event.payload.confId
        },
        params: null
    });
}
