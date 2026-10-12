/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        SYS_RELATIONSHIP_DEFINITION,
        TASK_STATE,
        getRelatedLists,
        getFormFields,
        SR_CONTROLLER_OUTPUT_FIELDS
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();

    const {
        name: updatedField
    } = event.payload;

    // proceed if either the related list or the form data changed
    if (updatedField === SR_CONTROLLER_OUTPUT_FIELDS.RELATED_LIST || updatedField === SR_CONTROLLER_OUTPUT_FIELDS.FORM) {
        const relatedLists = getRelatedLists(api.data.record);
        const formFields = getFormFields(api.data.record);
        if (relatedLists && formFields) {
            const unattestedRecord = relatedLists
                .find(d => d.value === SYS_RELATIONSHIP_DEFINITION.NOT_YET_REVIEWED.value);
            if (unattestedRecord) {
                if (formFields.state) {
                    let taskIsOpen = formFields.state.value === TASK_STATE.OPEN || formFields.state.value === TASK_STATE.WORK_IN_PROGRESS;
                    api.setState('disableSubmitBtn', unattestedRecord.count > 0 || !taskIsOpen);
                }
            }
        }
    }
}
