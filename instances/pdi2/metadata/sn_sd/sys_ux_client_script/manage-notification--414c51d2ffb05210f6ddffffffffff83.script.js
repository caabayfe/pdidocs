/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
        const {
        emitSuccessNotification
    } = imports["sn_sd.SDNotificationHandler"]();

    const elementId = event.elementId;
    const emit = api.emit;
    switch (elementId) {
        case 'update_record_contributing_indicator_po_projects':
            if (event.name == "DATA_OP_SUCCEEDED")
                emitSuccessNotification('pm-update-successful', 'PO Project mapping updated successfully', emit, helpers);
            break;
        case 'create_record_contributing_indicator_po_projects':
            if(event.name == 'DATA_OP_SUCCEEDED')
                emitSuccessNotification('pm-save-successful', 'New PO Project mapping created successfully', emit, helpers);
            break;
    }
}
