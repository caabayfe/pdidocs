/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    // Check if data resource exists
    if (api.data.clone_request_page_data_1?.output?.cloneProfileData) {
        const cloneProfileData = api.data.clone_request_page_data_1.output.cloneProfileData;
        
        // Set the counts from existing data
        api.setState('exclusionsCount', cloneProfileData.exclusionsCount);
        api.setState('preserversCount', cloneProfileData.preserversCount);
        api.setState('cleanupScriptsCount', cloneProfileData.cleanupScriptsCount);
    }
}
