/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // advancedFilterQuery : This state varable is going to govern the list filters. Tied to "filters" code for the list component.
    // filterQuery : This state variable is going to be holding the value of the build a foundation button.

    // if all the filters have been removed from the list, reset build a foundation button state and advancedFilterQuery
    if (!event.payload.query) {
        helpers.navigate.to('best_practices_home');
        api.setState("filterQuery", "");
        api.setState("advancedFilterQuery", "");
    } else {
        // If there is a payload on the filters of the list, then check if build a foundation query has been removed and clear the build a foundation button state variable
        if (!event.payload.query.includes(api?.state?.filterQuery)) {
            api.setState("filterQuery", "");
        }
        // Always set the advancedFilterQuery to whatever payload list filters' interactions spits.
        api.setState("advancedFilterQuery", event.payload.query);
    }
}
