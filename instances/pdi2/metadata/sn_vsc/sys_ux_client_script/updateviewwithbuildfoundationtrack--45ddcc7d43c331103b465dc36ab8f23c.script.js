/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // If the filterQuery from the next up section is null, then we will set it to "maturity_level=build_foundation"
    const btnFilterQuery = "maturity_level=build_foundation";
    if (!api?.state?.filterQuery) {
        api.setState("filterQuery" , btnFilterQuery);

        // If there has been no filters applied on the list, we would just need to bind the current button click ( Build  A Foundation ) from the next up section
        if (!api?.state?.advancedFilterQuery) {
            api.setState("advancedFilterQuery", btnFilterQuery);
            return;
        }

        // If build a foundation filter is present in the advancedFilterQuery, then we will remove that
        if (!api?.state?.advancedFilterQuery.includes(btnFilterQuery)) {
            api.setState("advancedFilterQuery", api.state.advancedFilterQuery + "^" + btnFilterQuery);
            return;
        }
    }
}
