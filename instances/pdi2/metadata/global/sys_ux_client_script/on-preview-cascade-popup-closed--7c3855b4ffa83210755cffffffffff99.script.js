/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { STATE } = imports["global.DMClientConstants"]();
    api.setState(STATE.PREVIEW_CASCADE_DATA, {rows: [], rowCount: 0, messages: []});
  
}
