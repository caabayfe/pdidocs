/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload.canCloseTab) {
        helpers.navigate.to('home', {}, {"customId": new Date().getTime()});
    }
}
