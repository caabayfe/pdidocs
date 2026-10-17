/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function() {
        const sys_id = api.context.props.experienceProperties?.update_set_sysid?.value;
        this.window.open(`/sys_update_set.do?sys_id=${sys_id}`,'_blank');
    });
}
