/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
 if (event.payload.title !== undefined) {
        api.emit('UXF#SET_DIALOG_HEADING_REQUEST', {
            value: event.payload.title
        })
    }

    if (event.payload.isDirty !== undefined) {
        api.emit('UXF#DIRTY_DIALOG_REQUEST', {
            value: event.payload.isDirty
        })
    }
}
