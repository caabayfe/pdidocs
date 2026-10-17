/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        success,
        projectInfo: {
            permissions,
        },
    } = api.data.get_project_info.output.data.snPo.GlidePromin.getProjectInfo;

    api.setState('permissions', permissions);
}
