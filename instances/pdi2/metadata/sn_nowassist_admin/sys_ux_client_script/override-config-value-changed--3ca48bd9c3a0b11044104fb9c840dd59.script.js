/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {sys_id} = event.context.item.value;
    if (sys_id) {
        const {variableName, variableValue} = event.payload;
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SN_NS_ADMIN_INPUT_VALUE_CHANGED',
            eventPayload: {
                sysId: sys_id,
                variableName,
                variableValue
            }
        });
    }
}
