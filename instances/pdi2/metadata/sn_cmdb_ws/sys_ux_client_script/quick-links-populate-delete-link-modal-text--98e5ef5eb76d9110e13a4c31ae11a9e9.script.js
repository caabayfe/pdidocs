/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var text = await helpers.translate("This will erase the quick link '{0}'. This action can't be undone.", api.state.quickLinksCurrentEditableItemDisplayText);
    api.setState('quickLinksDeleteLinkModalText', text);
    helpers.modal.open("delete_quick_link_confirm_destroy_modal", {});
}
