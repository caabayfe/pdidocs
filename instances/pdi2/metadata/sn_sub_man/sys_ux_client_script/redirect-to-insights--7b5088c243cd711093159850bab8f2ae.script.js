/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    /**
     * Redirect to Insights tab on card clicks
     */    
    const params = {sm: 'insights', menu: ''};
        api.emit("CONTENT_UPDATED", {
            params
        });
}
