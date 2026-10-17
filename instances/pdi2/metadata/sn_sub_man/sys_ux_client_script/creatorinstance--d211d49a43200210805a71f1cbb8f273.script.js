/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const hasCreatorDataSharingInstances = api.data.creator_instances_list.output.data.GlideRecord_Query.sn_sub_man_st_now_assist_creator_instances._rowCount > 0;
    api.setState('hasCreatorDataSharingInstances', hasCreatorDataSharingInstances);
}
