/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
if(!api.data.is_template.result.is_template.value){
    api.data.fetch_project_version.execute({
        projectId: api.context.props.projectId,
    });
}else{
    api.data.get_project_details_1.refresh();
}
}
