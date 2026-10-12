/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    
    // Check if event is from password field
    if (event.elementId === "password") {
        // Capture the password from the event
        var passwordValue = event.payload.fieldValue || event.payload.value || '';
    
        // Get the current modelParams
        var updatedModelParams = api.state.modelParams;
        updatedModelParams.admin_password = passwordValue;
        
        // Set it back
        api.setState("modelParams", updatedModelParams);
    }
}
