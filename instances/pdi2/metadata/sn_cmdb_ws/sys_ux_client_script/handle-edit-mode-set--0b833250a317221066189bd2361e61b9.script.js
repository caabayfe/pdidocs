/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { sectionId } = event.payload;
    const { dirtyFormSection } = api.state;

    if(dirtyFormSection?.isDirty) {
        helpers.modal.open('unsaved_changes_modal');
        api.setState("tempEditModeSection", sectionId);
        return;
    }
    //there is no section dirty, safe to switch to edit mode
    api.setState("editModeSection", sectionId);
}
