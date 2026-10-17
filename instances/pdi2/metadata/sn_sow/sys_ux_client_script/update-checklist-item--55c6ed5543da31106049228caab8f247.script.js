/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        api.data.update_checklist_item.execute({
        'table': 'checklist_item',
        'recordId': event.payload.itemId,
        'templateFields': 'complete='+event.payload.checked,
        'useSetDisplayValue': '' 
    });
}
