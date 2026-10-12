/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function() {
        const isATFavailable = api?.data?.is_atf_app_available?.output;
        if(isATFavailable){
            this.window.open(api.state.atfTestGeneratorAppLink);
        }else{
            this.window.open(api.state.storeAppLink);
        }
        
    },0);
}
