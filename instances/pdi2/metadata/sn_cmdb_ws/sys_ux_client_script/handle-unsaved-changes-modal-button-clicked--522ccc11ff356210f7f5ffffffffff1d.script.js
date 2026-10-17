/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const action = event.elementId === "save_changes_button" ? "save" : "discard";
    const {
        tempEditModeSection,
        editModeSection
    } = api.state;
        
    api.setState('unsavedChangesAction', {
        ts: Date.now(),
        action
    });
    helpers.modal.close();
    helpers.timing.setTimeout(() => {
        api.setState('unsavedChangesAction', {});
        if(action == "discard")
            api.setState('editModeSection', tempEditModeSection);
    });
}
