/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const conferenceCalls = api.state.conferenceCalls;
    if (!conferenceCalls || !event || !event.context || !event.context.item)
        return;
    const item = event.context.item;
    if ( (typeof item.index === "undefined") || !item.value || (typeof item.value.expanded === "undefined" ) )
        return;
    const callTypeIndex = item.index;
    const isExpanded = item.value.expanded;
    conferenceCalls[callTypeIndex].expanded = !isExpanded;
    notifyConfUtils.setCollapseIcon(conferenceCalls[callTypeIndex]);
    api.setState("conferenceCalls", conferenceCalls);
    if (api.state.isSearchingAndFiltering) {
        const searchAndFilterResults = api.state.searchAndFilterResults;
        searchAndFilterResults[callTypeIndex].expanded = !isExpanded;
        notifyConfUtils.setCollapseIcon(searchAndFilterResults[callTypeIndex]);
        api.setState("searchAndFilterResults", searchAndFilterResults);
    }
}
