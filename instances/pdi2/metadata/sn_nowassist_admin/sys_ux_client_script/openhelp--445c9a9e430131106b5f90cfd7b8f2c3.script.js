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
    api.emit('SN_HELP_PANEL#SHOW_REQUESTED', {
        appContext: {
            type: "custom",
            page: "skill-guided-setup",
            app_route: "now/now-assist-admin",
            params: {
                "skillConfig": api.context.props.payload.guided_context.skill_config_id
            }
        }
    });
}
