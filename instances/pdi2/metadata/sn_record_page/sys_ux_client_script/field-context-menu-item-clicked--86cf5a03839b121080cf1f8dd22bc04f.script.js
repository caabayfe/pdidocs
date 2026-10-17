/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var  modalSize = 'md';
    if(event.payload.itemId == 'configure_security')
    modalSize = 'lg';

    api.setState('displayOptions', { size : modalSize });
    api.setState('contents', {
        route: 'form-field-context-menu',
        fields: {
            table: event.payload.table,
            field: event.payload.field,
            itemId: event.payload.itemId
        },
        params: {
            itemData: event.payload.itemData
        }
    });
}
