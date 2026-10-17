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
        action_type,
        link
    } = api.context.props.payload.props_details;

    if (action_type === 'link') {
        // TODO: Handle navigating to route within same app
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: link
            }
        });
    }
}
