/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const {modal} = helpers;
    api.setState('catalogItemID', '');
    modal.close("[component-id$='item_preview_modal']");
}
