/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        modal
    } = helpers;
    const {
        targetRecord, previewPortal = 'swp'
    } = event.payload || {};
    if (targetRecord) {
        api.setState('catalogItemID', targetRecord);
        api.setState('previewPortal', previewPortal);
        modal.open("[component-id$='item_preview_modal']");
    }
}
