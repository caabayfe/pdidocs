/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        isEmptyObj
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);

    const { 
        formData,
        fieldsMetadata
     } = api.state;
    const { 
        section : {
            sysId: sectionId,
            captionDisplay: sectionName
        },
        editModeSection
    } = api.context.props;

    //treating this event as EDIT_MODE_REQUESTED
    api.emit('EXPLORE_CI_FORM_CONTROLLER#EDIT_MODE_ENABLED', {
        sectionId
    });

    //do not proceed if there is another section in edit mode already
    if(editModeSection)
        return ;

    api.setState('editMode', true);

    // For some reason, multiple controllers on the same page can have the same formData state.
    // Check to make sure the fields in the formData are actually part of the section
    const formDataToCheck = Object.fromEntries(
        Object.entries(formData).filter(([field]) => field in fieldsMetadata)
    );

    const isDirty = !isEmptyObj(formDataToCheck);
    if(isDirty) {
        api.emit('EXPLORE_CI_FORM_CONTROLLER#FORM_STATUS_CHANGED', {
            isDirty,
            sectionId,
            sectionName
        });
    }
}
