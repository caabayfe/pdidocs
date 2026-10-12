/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {ApiHelpers} params.helpers
 * @param {any} params.imports
 */
async function handler({api, event, helpers, imports}) {
    helpers.screen.updateStatus({title: await helpers.translate('Access Denied')});
}
