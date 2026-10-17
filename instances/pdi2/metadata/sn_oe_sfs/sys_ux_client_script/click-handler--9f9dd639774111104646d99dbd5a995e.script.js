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
        link,
        new_tab_config: target
    } = api.context.props.payload.props_details;
    api.emit("NAV_ITEM_SELECTED", {
        external: {
            url: link,
            target: target
        }
    });
}
