/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var response = event.payload.data.output;
    var respObj = JSON.parse(response);
    
    if (!respObj.pass) {
        api.setState("serverErrorMessage", respObj.errorMessage);
        return;
    }

    api.data.save_request_and_debug_logs.execute({
        "debugLogAPIResponse": response,
        "requestId": api.data.request_resource.result._row_data.uniqueValue
    });
}
