/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const initialSidebarEnabledVal = api.state.settings.fields.enabled.value;
    const currSidebarEnabledVal = api.state.toggleValue;
    
    if (currSidebarEnabledVal !== initialSidebarEnabledVal) {
        helpers.modal.open("modal_remove_sidebar");
    }
}
