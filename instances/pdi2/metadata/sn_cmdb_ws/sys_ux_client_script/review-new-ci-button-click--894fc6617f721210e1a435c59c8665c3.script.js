/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        className: table,
        sysId
    } = api.state.resultSummary;

    helpers.navigate.to('record', { table, sysId }, null, null, null, "current");
}
