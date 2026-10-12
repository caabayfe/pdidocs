/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 helpers.navigate.to("promin_project", {
            projectId: event.payload.cell.metadata.referenceSysId,
            stage: 'set-objectives'
        }, null, true);
}
