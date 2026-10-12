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
    api.setState('amount_of_data_copied_from_large_tables', event.payload.value);
    api.setState('amountOfDataCopiedFromLargeTablesSummaryLabel', event.payload.item.label);
    if (event.payload.value == "last_90_days") {
        api.setState('highlightText', "Selecting 'Last 90 days' can increase clone time.");
        api.setState('highlightTextShow', true);
    } else
        api.setState('highlightTextShow', false);
}
