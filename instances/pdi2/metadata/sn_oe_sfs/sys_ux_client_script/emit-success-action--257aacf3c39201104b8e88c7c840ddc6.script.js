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
    api.emit('CI_MENU_ITEM_ACTION', {
        'action': {
            'name': 'reverted_to_default',
            'icon_name': api.context.props.payload.highlight_icon
        }
    });
}
