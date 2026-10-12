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

    if (!api.data.dt_for_virtual_agent_plugin_availability.output.isBUPluginActive) {
        api.emit('NAV_ITEM_SELECTED', {
            route: "plugins",
            reload: false
        });
    } else {
        api.emit('NAV_ITEM_SELECTED', {
        external: {
            url: 'now/app-manager/home/plugin/id/com.glide.cs.dynamic.translation.virtual_agent/details',
        }
    });
    }
}
