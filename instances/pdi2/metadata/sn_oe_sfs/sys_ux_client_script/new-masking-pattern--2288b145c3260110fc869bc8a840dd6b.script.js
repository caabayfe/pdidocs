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
    try {
        const {
            table,
            sysId
        } = event.payload.wrappedPayload.fields;
        api.emit("NAV_ITEM_SELECTED", {
            route: 'record',
            fields: {
                ...event.payload.wrappedPayload.fields,
                'sysId': sysId == '-1' ? '-1_uid_' + Date.now() : sysId
            },
            params: {
                ...event.payload.wrappedPayload.params
            },
            reload: true,
        });
    } catch (e) {
    }
}
