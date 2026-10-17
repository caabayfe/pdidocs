/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var loadMoreResultStatus = event.payload.data.output.result;
    if(loadMoreResultStatus === "COMPLETE") {
        api.setState("hideLoadButtons",true);
        api.setState("hideInfoAlert",true);
    }
}
