/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var data = [...api.state.capabilityGroups];
    data.find(i => i.sys_id === event.context.item.value.sys_id).selectedProvider = event.payload.value;
    data.find(i => i.sys_id === event.context.item.value.sys_id).enableSave=true;
    api.setState("capabilityGroups", data);
}
