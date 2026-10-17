/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('dataFetched', false);
    api.setState('packageName', api.data.look_up_records.results[0].manifest_name.value);
    api.setState('downloadUrl', '/download_all_attachments.do?sysparm_sys_id=' + 
    api.data.look_up_records.results[0].sys_id.value);
    api.setState('redirectUrl', '/now/conversation/settings/teams-manifest-configuration/' + 
    api.context.props.botname);
}
