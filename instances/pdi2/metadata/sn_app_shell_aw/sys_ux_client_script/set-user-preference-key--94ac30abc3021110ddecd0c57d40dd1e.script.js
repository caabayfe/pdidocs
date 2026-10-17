/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("userPrefKey", "workspace.layout.subToolbar.preferences."+api.context.app.appId);
    //api.data.look_up_user_preferences_1.refresh();
}
