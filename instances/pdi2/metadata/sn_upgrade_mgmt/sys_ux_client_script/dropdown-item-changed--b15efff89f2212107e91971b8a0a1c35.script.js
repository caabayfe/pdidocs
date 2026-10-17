/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        const previousSelectedIds = api?.state?.selectedDropdownIds;
        previousSelectedIds[event?.context?.item?.index] = [event?.payload?.items?.[0]?.id];
        api?.setState("selectedDropdownIds", previousSelectedIds);
    } catch(error) {
        console.log("Error executing UIB client script in upgrade management application: Dropdown item changed", error);
    }
}
