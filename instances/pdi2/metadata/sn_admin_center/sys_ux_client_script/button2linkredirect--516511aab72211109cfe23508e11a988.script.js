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
        button2Info
    } = api.context.props.payload.listItemPayload;
    if (!button2Info)
        return;
    if (!button2Info.url)
        return;

    api.emit('NAV_ITEM_SELECTED', {
        external: {
            url: button2Info.url,
            target: '_blank'
        }
    });
}
