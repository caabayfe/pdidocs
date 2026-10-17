/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function(){
        // Refresh page if current page timestamp is different than last visit
        // to clear page cache.
        if (api.state.cacheTimeStamp != api.context.props.ts) {
            api.setState("cacheTimeStamp",api.context.props.ts);
            this.document.location.reload();
        }
    })

}
