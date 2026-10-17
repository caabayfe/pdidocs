/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let certificatePassword = api.state.certificatePassword;
    if (certificatePassword === null || certificatePassword.length === 0) {
        return;
    }
    
    // Update emptyState client state
    api.setState('emptyState', {isHidden: true, message: "", icon: ""});

    // Turn off button to prevent double click
    api.setState('generatorOperational', false);
}
