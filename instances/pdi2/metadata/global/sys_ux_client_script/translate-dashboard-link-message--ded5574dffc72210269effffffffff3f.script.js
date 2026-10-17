/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate(
        "Check the <a href=\"{0}\" target=\"_blank\">Inbound API Integration Usage dashboard</a> to view detailed usage statistics for each OAuth client",
        "/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/543b66e7f350321033d25169f6968c2e"
    ).then(text => api.setState("translated_api_limits_link", text));
}
