/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        sectionId,
        sectionName,
        isDirty
    } = event.payload;

    const { 
        dirtyFormSection,
        editModeSection
    } = api.state;

    
    if(!isDirty && sectionId == editModeSection)
        api.setState('editModeSection', '');
    
    if(!isDirty && dirtyFormSection?.sectionId != sectionId)
        return ;

    const newDirtyFormSection = isDirty ? {...event.payload} : {};
    api.setState('dirtyFormSection', newDirtyFormSection);
    api.emit('EXPLORE_CI_MAIN_CONTENT#DIRTY_FORM_STATUS_CHANGED', {
        isDirty
    });
}
