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
    api.setState('userHasInteracted', true);
    api.setState('filter_attachment_data', event.payload.value);
    api.setState('excludeAttachmentDataSummaryValue', event.payload.value == true ? api.state.text.Yes : api.state.text.No);
}
