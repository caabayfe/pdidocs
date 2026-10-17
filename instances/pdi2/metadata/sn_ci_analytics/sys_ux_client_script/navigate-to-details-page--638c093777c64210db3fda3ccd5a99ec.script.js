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
    const fId = event.payload.sys_id;
    const {
        startDate,
        endDate
    } = api.context.props;
    api.emit('NAV_ITEM_SELECTED', {
        route: 'funnel-details',
        fields: {
            'funnelId': fId
        },
        params: {
            startDate,
            endDate,
            aceNave: 'funnels'
        }
    });
}
