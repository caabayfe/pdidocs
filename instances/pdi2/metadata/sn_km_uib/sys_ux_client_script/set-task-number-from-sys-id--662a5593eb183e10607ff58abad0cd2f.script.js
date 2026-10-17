/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(api.state.genAiSourceRecordId){
        var number = api.data.fetch_task_number_from_sysid.result.number.value;
        api.setState('taskNumber', number);
    }
}
