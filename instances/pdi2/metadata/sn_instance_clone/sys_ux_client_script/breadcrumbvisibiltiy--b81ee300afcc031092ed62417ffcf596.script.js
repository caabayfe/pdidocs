/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const isConfigContextVal = api.context.props.nowUxfParentPageComponentId !== undefined;
        if(! isConfigContextVal){
            api.setState('isConfigContext', false);
        }
}
