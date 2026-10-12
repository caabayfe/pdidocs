/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { showClientSecretNotification } = imports["global.APIAuthenticationConsoleUtil"]();
    const clientSecretAutoGenLength = api.data.get_oauth_entity_metadata_1.output.clientSecretAutoGenLength;
    let clientSecretFieldLength = (api.data.get_oauth_entity_record_1.output.client_secret || '').length;
    showClientSecretNotification(api, event, helpers, clientSecretAutoGenLength, clientSecretFieldLength);
}
