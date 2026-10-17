/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        TASK_STATE,
        getFormFields,
        SR_CONTROLLER_OUTPUT_FIELDS
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

    const {
        name: updatedField
    } = event.payload;
    
    if (updatedField === SR_CONTROLLER_OUTPUT_FIELDS.FORM) {
        const formFields = getFormFields(api.data.record);
        if (formFields && formFields.state) {
            const enableReassignButton = formFields.state.value === TASK_STATE.OPEN ||
                formFields.state.value === TASK_STATE.WORK_IN_PROGRESS;
            api.setState("disableReassignBtn", !enableReassignButton);
        }
    }
}
