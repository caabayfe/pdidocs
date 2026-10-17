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
    const output = api.data.get_ai_agent_plugin_status.output;
    if (output.errors) {
        api.setState('aiAgentPluginActive', false);
    } else {
        api.setState('aiAgentPluginActive', output.active);
    }
}
