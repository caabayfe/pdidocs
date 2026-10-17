/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { updateUserPayload } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const item = event.context.item.value;
    const {payload} = event;
    event.payload.field = item.element;
    event.payload.displayValue = payload.item.label;
    updateUserPayload(event);
}
