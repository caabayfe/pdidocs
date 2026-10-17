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
    if (!event.payload.isElementsInitialized)
        api.setState('filterSelected', event.payload.filterId);

    //This state persists the filter ID for expanded filter regardless of its initialization state.
    api.setState('selectedFilterWithoutInitializationContext', event.payload.filterId);
}
