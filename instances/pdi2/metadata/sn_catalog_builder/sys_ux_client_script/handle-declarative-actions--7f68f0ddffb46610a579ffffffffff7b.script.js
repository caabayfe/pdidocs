/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { modal } = helpers;
    const wrappedAction = event.payload.wrappedAction;
    if (wrappedAction === "SN_CATALOG_BUILDER#NEW_CLIENT_SCRIPT_CLICKED"){
        api.setState('clientScriptId', null);
        modal.open('[component-id$="wizard_model"]');
    }
    else if (wrappedAction === "SN_CATALOG_BUILDER#CLIENT_SCRIPT_EDITED"){
        if (api.state.selectedRecords.count === 1) {
            const id = api.state.selectedRecords.sysIds[0];
            api.setState('clientScriptId', id);
        } 
        modal.open('[component-id$="wizard_model"]');
    }
    else if (wrappedAction === "SN_CATALOG_BUILDER#CLIENT_SCRIPT_DELETED") {
           modal.open('[component-id$="confirm_client_script_delete"]');
        }

}
