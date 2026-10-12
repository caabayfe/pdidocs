/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var fullTab = event.payload.selectedTab;
    var subTabId;

    if (fullTab) {
        subTabId = fullTab.replace("id=", "");
    } else {
        subTabId = "scores";
    }

    api.setState("selected_events_tab", subTabId);
}
