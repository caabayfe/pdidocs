/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const tabId = (event.payload.selectedTabIndex != null && event.payload.selectedTabIndex != undefined) ? event.payload.selectedTabIndex : api.context.props.selectedTabIndex;
    const tabs = api.state.tabs;
    if (tabId || tabId == 0) {
        api.setState('categoryFilter', tabs[tabId]['id']);
    }
}
