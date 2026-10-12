/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let hideSummaryUserPref = "sn_cmdb_ws.dm.dismiss_summary";
    let hideSummaryContainer = true;

    for (let i = 0; i < api.data.look_up_user_preferences.result.preferences.length; i++) {
        const pref = api.data.look_up_user_preferences.result.preferences[i];
        if (pref.name === hideSummaryUserPref && (!pref.value || pref.value === "false"))
            hideSummaryContainer = false;
    }

    api.setState("hideSummaryContainer", hideSummaryContainer);
}
