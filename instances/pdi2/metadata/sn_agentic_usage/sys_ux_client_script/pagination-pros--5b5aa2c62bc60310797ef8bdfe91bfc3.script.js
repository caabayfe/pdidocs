
/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const payload = event.payload;
    if (event.name === 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET') {
        api.setState('pageSize', event.payload.value);
        // Reset to page 1 — the old page number may no longer exist once the
        // page size (and therefore total page count) changes.
        api.setState('pageNumber', 1);
    } else {
        api.setState('pageNumber', +event.payload.value + 1);
    }
}
