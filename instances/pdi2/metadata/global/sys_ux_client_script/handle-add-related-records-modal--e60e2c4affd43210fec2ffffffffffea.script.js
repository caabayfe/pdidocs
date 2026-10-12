/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {STATE } = imports["global.DMClientConstants"]();

    const { elementId, payload } = event;
    if(!elementId || !payload) return;
    const related_record = api.state.related_record_draft;
    if(elementId == STATE.ACTION) related_record[elementId] = payload.value;
    else related_record[elementId] = payload;
    if(related_record.action && related_record.reference) {
        api.setState("isRelatedRecordsAddButtonDisabled", false);
    }
    api.setState("related_record_draft", related_record);
}
