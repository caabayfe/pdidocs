/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let timer = helpers.timing.setInterval(()=> api.data.upgrade_management___get_upgrade_details_1.refresh(), 10000);
    api.setState('refreshTimer', timer);
    api.setState('targetPatch', api.context.props.experienceProperties.target_patch_label.value);
    api.setState('targetPatchId', api.context.props.experienceProperties.target_patch_id.value);
}
