/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { ERROR_MESSAGES, emitErrorNotification, getFormFields } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    const selectedSysIds = event.payload.sysIds; 
    const selectedSysIdsArr = selectedSysIds.split(",");
    const allRecordsSelected = api.state.rowSelection.allRecordsSelected;

    //check current assignee first
    const {
        assigned_to: {
            value: assignedToValue
        }
    } = getFormFields(api.data.record);
    const currentUser = api.context.session.user.sys_id;
    const emit = api.emit;
    const translate = helpers.translate;

    if(!allRecordsSelected && selectedSysIdsArr.length < 2) {
        emitErrorNotification(ERROR_MESSAGES.DUPLICATE_MINIMUM.error,emit,translate,helpers);
    } else {
        helpers.modal.open('confirm_remove_duplicates');
    }
    
}
