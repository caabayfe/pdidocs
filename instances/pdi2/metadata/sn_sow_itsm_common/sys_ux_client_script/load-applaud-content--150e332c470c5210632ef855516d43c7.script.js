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
    const applaud_plugin_status = api.data.enabled_plugins.output && api.data.enabled_plugins.output.length > 0 ? api.data.enabled_plugins.output.find(p => p.id === "com.snc.app_applaud_ux") : {};
    const check_for_applaud_user_role = api.data.check_user_roles.output && api.data.check_user_roles.output["sn_applaud.user"];
    const showApplaud = applaud_plugin_status.active && check_for_applaud_user_role
        
    api.setState("showApplaud", showApplaud);
    if (showApplaud) {
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: 'viewport_qvy',
            route: 'applaud',
            fields: null,
            params: null
        });
    }
}
