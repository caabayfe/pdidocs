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
        payload: {
            previousValue
        }
    } = event;

    api.emit('VIEWPORT_ROUTE_DISMISSED', {
        viewportElementId: 'list_panel_viewport',
        route: 'quick-edit',
        fields: {
            sysId: previousValue
        }
    });

    api.emit('VIEWPORT_ROUTE_REQUESTED', {
        viewportElementId: 'list_panel_viewport',
        route: 'quick-edit',
        fields: {
            sysId: api.context.props.sysId
        }
    });
}
