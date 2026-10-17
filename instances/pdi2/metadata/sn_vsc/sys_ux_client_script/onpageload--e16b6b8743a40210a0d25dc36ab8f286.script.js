/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Always reset the advancedFilterQuery state to whichever query params we might be having returning to / reloading the page
    api.setState("advancedFilterQuery", ( api?.context?.props?.query || '' ));
}
