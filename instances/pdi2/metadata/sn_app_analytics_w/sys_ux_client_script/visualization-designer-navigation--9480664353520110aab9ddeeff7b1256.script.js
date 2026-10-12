/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     const sysId = event.payload && event.payload.sysId;
    if (sysId)
        helpers.navigate.to('visualization-designer', null, {sysid: sysId});
    else
        helpers.navigate.to('visualization-designer');
}
