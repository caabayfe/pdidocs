/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.update_iar_record.execute({
        table: 'sys_cs_auto_resolution_configuration',
        recordId: api.state.recordId,
        active: !api.state.active
    });
}
