/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    helpers.modal.open('add_relationship_modal', {
        headerLabel: await helpers.translate('Add relationships')
    });
}
