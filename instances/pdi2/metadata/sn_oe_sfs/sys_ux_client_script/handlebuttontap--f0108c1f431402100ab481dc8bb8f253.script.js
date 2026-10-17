/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.buttonId == 'addChat') {
        api.emit('OPEN_CREATE_CHAT_MODAL_REQUESTED', 
            { 
                table: api.context.props.table, 
                recordId: api.context.props.recordId 
            }
        );
    }
}
