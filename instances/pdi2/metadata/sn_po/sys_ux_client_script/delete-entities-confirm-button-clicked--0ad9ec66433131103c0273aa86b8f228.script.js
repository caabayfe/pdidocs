/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.delete_entities.execute({
        table: 'promin_project_entity',
        query: 'sys_idIN' + api.state.selectedEntityCardId.join(','),
    });
}
