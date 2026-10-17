/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { removeMessageWithIndex } = imports["global.DMClientMessageHandler"]();
    const { index } = event.payload;
    removeMessageWithIndex(api, helpers, index);
}
