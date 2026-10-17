/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload.action_id === "delete") {
        api.setState('queryIdToDelete',event.payload.query_id);
        helpers.modal.open('confirm_and_destroy');
    } else if (event.payload.action_id === "modify") {
        helpers.navigate.to('multisource-query',null,{
            'queryType' : event.payload.query_type,
			'querySysId' : event.payload.query_id
        },false,false,'current',null,event.payload.query_name);

    }
}
