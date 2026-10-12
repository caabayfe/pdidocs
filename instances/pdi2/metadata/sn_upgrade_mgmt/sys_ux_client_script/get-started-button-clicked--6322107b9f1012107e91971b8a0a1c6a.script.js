/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        api.setState("getStartedAllowed", false);
        api.setState("selectedVersion", event?.context?.item?.value?.versions?.filter(version => version?.id === api?.state?.selectedDropdownIds?.[event.context.item.index][0])[0]);
        api.data.check_if_session_in_progress.refresh();
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: Get started button clicked", e);
    }
}
