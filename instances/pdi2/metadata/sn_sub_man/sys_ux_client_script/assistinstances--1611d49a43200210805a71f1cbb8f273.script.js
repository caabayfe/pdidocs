/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasAssistDataSharingInstances = api.data.assist_instance_list.output.data.GlideRecord_Query.sn_sub_man_st_instance_used_assist_count._rowCount > 0;
    api.setState('hasAssistDataSharingInstances', hasAssistDataSharingInstances);
}
