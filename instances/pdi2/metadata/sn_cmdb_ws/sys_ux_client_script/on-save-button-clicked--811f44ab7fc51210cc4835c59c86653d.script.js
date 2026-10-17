/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { IRE_ACTIONS, transformUserPayload } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const {
        userPayload,
        selectedClass
    } = api.state;

    //convert userPayload to finalUserPayload
    api.setState('prevUserPayload', userPayload);
    var finalUserPayload = transformUserPayload(userPayload, selectedClass);            
    api.data.identify_ci.execute({
        payload: finalUserPayload,
        action: IRE_ACTIONS.IDENTIFY
    });

    api.setState("userPayload", finalUserPayload);
}
