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
        api.emit('ACE_ACTION_PERFORMED_RELAY_87b330a2536141102958ddeeff7b12b2', {
            eventName: 'BUTTON_CLICKED#EXTERNAL_URL_NAVIGATION',
            eventPayload: {
                content_block: api.context.props.payload,
                actual_event: event
            }
        });
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: link
            }
        });
    }
}
