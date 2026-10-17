/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Check for dirty form 
    if (api.state.isDirty) {
        // Form is dirty. Display confirmation modal
        helpers.modal.open('confirm_1');
    } else {
        // Form is clean. Naviagte to multisource analytics page
        helpers.navigate.to('multisource-analytics');
    }
}
