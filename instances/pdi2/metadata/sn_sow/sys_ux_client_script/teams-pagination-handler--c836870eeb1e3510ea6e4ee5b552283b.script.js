/**
 * TeamsPaginationHandler
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { name, payload } = event;
    switch (name) {
        case "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET":
            if (api.state.pageIndex != payload.value) {
                api.setState("pageIndex", Number(payload.value));
            }
            break;
        case "NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET":
            api.setState("pageSize", Number(payload.value));
            break;
    }
}
