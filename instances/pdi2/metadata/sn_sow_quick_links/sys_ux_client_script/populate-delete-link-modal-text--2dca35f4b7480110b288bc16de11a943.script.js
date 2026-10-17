/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var text = await helpers.translate("This will remove the quick link '{0}'. This action can't be undone.", api.state.currentEditableItemDisplayText);
    api.setState('deleteLinkModalText', text);
    helpers.modal.open("confirm_and_destroy_1", {});
}
