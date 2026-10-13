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
        item
    } = event.payload;

    if (api.context.props.funnelId) {
        const {
            funnelName,
            steps
        } = api.state;
        if (funnelName !== api.data.get_funnel_record.output.name ||
            JSON.stringify(steps) !== JSON.stringify(api.data.get_funnel_record.output.steps)) {
            api.setState('currentBreadcrumbsItemId', item.id);
            helpers.modal.open(`[component-id$='unsaved_funnel_details']`);

            return;
        }
    }

    const { startDate, endDate } = api.context.props;
    let fields = {},
        params = {
            startDate,
            endDate,
            timestamp: Date.now()
        };
    if (item.id === 'funnel-details') {
        fields = {
            funnelId: api.context.props.funnelId
        };
    }

    helpers.navigate.to(item.id, fields, params);
}
