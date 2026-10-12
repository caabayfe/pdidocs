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
    api.emit('NAV_ITEM_SELECTED', {
        route: event.payload.route,
        fields: {
            aceAppConfigId: api.context.props.aceAppConfigId,
            table: event.payload.table,
            sysId: event.payload.sysId
        },
        params: {
            query: event.payload.query
        },
        redirect: true
    });
}
