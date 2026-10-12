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
        button1Info
    } = api.context.props.payload.listItemPayload;
    if (!button1Info)
        return;
    if (!button1Info.url)
        return;

    api.emit('NAV_ITEM_SELECTED', {
        external: {
            url: button1Info.url,
            target: '_blank'
        }
    });
}
