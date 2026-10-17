/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Only allow after 200ms to call api for filtered list for a given user string
    helpers.timing.setTimeout(() => {
        const value = event?.payload?.value;
        const modelId = event?.payload?.name?.split(",")[0];
        const typeaheadSourceTable = event?.payload?.name?.split(",")[3];
        const currentElementId = event?.context?.item?.value?.currentElementId;
        api.setState("searchString", value);
        api.setState("sourceTableForTypeAhead", typeaheadSourceTable);
        api.setState("currentElementId", currentElementId);
        /**
         * TODO(As part of separate defect/story): 
         * The following check should not happen in here, but to be handled within the client payload.
         * The payload itself should have this data readily available on the UI
         * Also, this is specifically for the "Role granted is one of" typeahead component
         * For policies which will have trigger type : "High privileged role is granted"
         */
        if (modelId == "504c3374534202105f95ddeeff7b1265") {
            api.setState("additionalQuery", "name=admin^ORname=oauth_admin^ORname=impersonator^ORname=security_admin");
        } else {
            // Reset the state variable, otherwise it will be fired for other typeaheads
            api.setState("additionalQuery", "");
        }
    }, 200);
}
