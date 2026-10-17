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
    let result = api.data.is_plugin_installed.output;
    const pluginsMap = {
        ["com.snc.ms_teams.it"]: "msTeamsPlugin",
        ["com.snc.notify.twilio_direct"]: "notifyPlugin"
    };
    for (let i = 0; i < result.length; i++) {
        let plugin = pluginsMap[result[i].id];
        api.setState(plugin, result[i].active);
    }
}
