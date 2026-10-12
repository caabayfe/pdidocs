/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var query_id = event.payload.query_id;
    if(event.payload.action_id === "delete") {
        api.setState('queryIdToDelete',query_id);
        helpers.modal.open('confirm_and_destroy');
    } else if (event.payload.action_id === "run") {
        api.setState('queryIdToRun',query_id);
        api.data.register_multisource_query.execute({
            "querySysId" : query_id
        });
    }
}
