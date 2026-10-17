/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // User dicarded changes. Naviagte to multisource analytics page
    helpers.navigate.to('multisource-analytics');  
}
