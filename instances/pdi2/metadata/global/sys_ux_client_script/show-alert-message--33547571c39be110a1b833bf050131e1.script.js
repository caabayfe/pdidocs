/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var alertMessageJSON = [{"status":"info",
    "icon":"circle-info-outline",
    "content": await helpers.translate("Save changes before training your model")}];
    if (api.state.internalProperties.required) {
        api.setState('alertMessage', alertMessageJSON);
    }
}
