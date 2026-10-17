/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.name == 'DATA_OP_SUCCEEDED') {
        api.setState('projectId', event.payload.data.output.data.GlidePromin_Mutation.createPlayBookProject.projectId);
    }
}
