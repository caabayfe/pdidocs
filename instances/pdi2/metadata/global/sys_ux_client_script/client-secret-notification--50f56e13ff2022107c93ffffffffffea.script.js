/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { showClientSecretNotification } = imports["global.APIAuthenticationConsoleUtil"]();
    const clientSecretAutoGenLength = api.data.get_oauth_entity_metadata_1.output.clientSecretAutoGenLength;
    await showClientSecretNotification(api, event, helpers, clientSecretAutoGenLength, clientSecretAutoGenLength);
}
