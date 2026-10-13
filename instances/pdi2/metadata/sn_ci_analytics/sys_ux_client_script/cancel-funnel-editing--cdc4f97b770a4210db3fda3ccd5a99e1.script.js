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
        currentBreadcrumbsItemId: id
    } = api.state;
    const {
        startDate,
        endDate,
        funnelId
    } = api.context.props;

    let route = 'funnels';

    let fields;
    if (id === 'funnel-details') {
        route = id;
        fields = {
            funnelId
        };
    };

    api.emit('NAV_ITEM_SELECTED', {
        route: route,
        fields: fields,
        params: {
            funnelId,
            startDate,
            endDate
        }
    });
}
