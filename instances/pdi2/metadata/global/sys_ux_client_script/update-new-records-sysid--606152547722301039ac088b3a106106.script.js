/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var sysId = api.context.props.sysId+"";
    if(sysId && sysId.startsWith('-1_uid')) {
        sysId = '-1';
        api.setState('sysId', sysId);    
    }
}
