/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { name: propName, value } = event.payload;

    const {
        isEmptyObj
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);

    const {
        handleFormDataPropsChange,
        handleSelectedNavPropsChange
    } = imports["sn_cmdb_ws.ExploreCIMainContentUtils"](...arguments);

    if (propName === "selectedNav") {
        if (api.state.editModeSection) {
            const action = "close";
            api.setState('unsavedChangesAction', {
                ts: Date.now(),
                action
            });
            helpers.timing.setTimeout(() => {
                api.setState('unsavedChangesAction', {});
                api.setState("editModeSection", "");
            });
        }
        handleSelectedNavPropsChange(value);
    } else if(propName === "formData") {
        handleFormDataPropsChange(value);
    } else if(propName === "handleUnsavedChanges") {
        const { dirtyFormSection } = api.state;
        //open unsaved changes modal if handleUnsavedChanges property is updated with a new timestamp
        if(!isEmptyObj(dirtyFormSection)) {
            helpers.modal.open('unsaved_changes_modal');
        }
    }
}
