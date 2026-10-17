/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.update_record.execute({
        table: 'protected_table_configuration',
        recordId: event.context.item.value._row_data.uniqueValue,
        templateFields: event.elementId + "=" + event.payload.item.id,
        useSetDisplayValue: false
    });
}
