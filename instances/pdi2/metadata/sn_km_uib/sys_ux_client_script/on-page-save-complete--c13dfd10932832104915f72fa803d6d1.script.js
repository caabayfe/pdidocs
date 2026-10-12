/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {payload} = event;
    const {status} = payload;
    const sysId = api.context.props.sysId;
    const extraParams = api.state.extraParams;
    
    // If sysId is -1, this is a first-time save; handle timestamp update and bail out
    if (status === 'success' && sysId === "-1") {
        api.setState("gapsSysIds", extraParams.gapsSysIds);
    }
}
