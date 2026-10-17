/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var userhasGroup = api.data.user_has_group.output.data.GlideRecord_Query.sys_user_grmember._rowCount > 0;
    const changes = api.state.serializedChanges;
    const fieldName = "assignment_group";       
    const fields = JSON.parse(JSON.stringify(api.state.fields));

    if(!userhasGroup) {
        const modalPath = api.context.props.modalPath;
        let sowFormModal = imports["sn_sow_itsm_common.SOWFormModal"]();
        let processField = sowFormModal.getProcessFields(modalPath);
        if (typeof processField == "function") {
            processField(fields, fieldName, "", "");
            api.setState("fields", fields);
        }
    }
}
