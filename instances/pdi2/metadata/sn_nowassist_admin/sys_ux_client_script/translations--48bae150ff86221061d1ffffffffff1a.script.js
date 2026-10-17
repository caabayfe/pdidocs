/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    var translations ={
        successMessage: await helpers.translate("Manage Integration changes have been saved successfully"),
        failureMessage: await helpers.translate("Failed to update Manage Integration")
    };
    api.setState('translations', translations);

}
