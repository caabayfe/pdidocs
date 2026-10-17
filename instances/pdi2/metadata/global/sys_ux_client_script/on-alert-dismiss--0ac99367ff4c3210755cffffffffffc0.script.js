/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { STATE } = imports["global.DMClientConstants"]();
    //Generic Handler for all individual alert dismiss action
    const { alertStateName } = event.payload;
    const alertState = deepClone(api.state[alertStateName]); 
    alertState.hide = true;
    api.setState(alertStateName, alertState);
}
