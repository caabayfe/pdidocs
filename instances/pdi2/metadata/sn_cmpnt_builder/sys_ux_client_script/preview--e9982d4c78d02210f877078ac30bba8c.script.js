/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const componentSysId = api.context.props.componentSysId;
    const deviceMode = api.elements.builder_core.deviceMode;
    api.emit('NAV_ITEM_SELECTED',{
        external:{
            url:`now/cbinternal/preview/${componentSysId}/params/deviceMode/${deviceMode}`,
            target:'_blank',
           
        },
         params:{'componentSysId':componentSysId, 'deviceMode':deviceMode}
    });
}
