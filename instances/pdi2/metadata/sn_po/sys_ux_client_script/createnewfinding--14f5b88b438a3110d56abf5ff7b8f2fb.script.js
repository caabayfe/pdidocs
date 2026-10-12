/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 helpers.navigate.to(undefined, undefined, {}, false, false, null, {
        url: `/nav_to.do?uri=%2Fpromin_finding_def.do%3Fsys_id%3D-1%26sysparm_query%3Dprocess_def%253d${api.data.fetch_process_configuration.result.sys_id.value}%5Eproject%3D${api.context.props.modelDefinition.projectId}%5Etype%3DPROJECT`
    });
}
