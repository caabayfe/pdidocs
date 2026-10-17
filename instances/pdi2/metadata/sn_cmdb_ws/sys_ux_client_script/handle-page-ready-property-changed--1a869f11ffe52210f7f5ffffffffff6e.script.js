/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        setFieldsMetadata,
        closeEditMode
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    const { maskedAttributes } = api.state;
    const {
        section : {
            sysId: sectionId
        }
    } = api.context.props;

    if(event.name == "MACROPONENT_READY" || event.payload?.name == "fields" || event.payload?.name == "section"){
        setFieldsMetadata(maskedAttributes, true);
        const formData = Object.fromEntries(
            Object.entries(api.state.formData)?.filter(([field]) => maskedAttributes.includes(field))
        );
        api.setState('formData', formData);
        api.setState('isDirty', Object.keys(formData).length>0);
    } else if (event.payload?.name === "editModeSection") {
        //if the new value is the current section, switch to edit mode, else switch to view mode
        api.setState('editMode', event.payload.value === sectionId);
    }
}
