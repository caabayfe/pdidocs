/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        const extraParams = api.state.extraParams;
        
        if(!extraParams) return;
        
        const uriDecoded = decodeURIComponent(extraParams);
        const uriObj = JSON.parse(uriDecoded);
        api.setState('extraParams', uriObj);
    } catch (err) {
        console.error('Failed to decode extraParams \n', err);
    }
}
