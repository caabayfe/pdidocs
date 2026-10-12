/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if(parseInt(event.payload.selectedTabIndex,10) > 0){
        api.setState('hideNewAssetBtn', true);
    }else{
        api.setState('hideNewAssetBtn', false);
    }
}
