/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {emitSuccessNotification } = imports["sn_sd.SDNotificationHandler"]();

    const elementId = event.elementId;
    const emit = api.emit;
    switch(elementId) {
        case 'delete_multiple_records':
            if (event.name == "DATA_OP_SUCCEEDED")
                emitSuccessNotification('roles1', 'Users removed from the selected role.', emit, helpers);
            break;
        case 'assign_role_to_users':
            if (event.name == "DATA_OP_SUCCEEDED")
                emitSuccessNotification('roles2', 'New users added to the selected role.', emit, helpers);
            break;
    }
}
