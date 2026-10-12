/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.delete_breakdowns.execute({
        table: 'promin_breakdown_field',
        query: 'sys_idIN' + api.state.breakdownsListSelectedRecords.join(','),
    });
}
