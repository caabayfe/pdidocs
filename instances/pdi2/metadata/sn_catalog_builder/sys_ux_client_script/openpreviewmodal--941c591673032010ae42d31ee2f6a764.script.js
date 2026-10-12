/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
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
        targetRecord
    } = event.payload || {};
    var propertyValue = api.data?.look_up_preview_portal_property?.properties?.value;
    var previewPortal = propertyValue || 'swp';
    if (targetRecord) {
        api.setState('catalogItemID', targetRecord);
        api.setState('previewPortal', previewPortal);
        modal.open("[component-id$='item_preview_modal']");
    }
}
