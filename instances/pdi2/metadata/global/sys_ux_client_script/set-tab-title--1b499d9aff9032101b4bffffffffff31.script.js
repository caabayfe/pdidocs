/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const title = await helpers.translate('Create a change request');
    api.emit('SCREEN_STATUS_CHANGED', {"title": title});
}
