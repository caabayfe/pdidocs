/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Get the concerned tabs for the selected rule type.
    var allTabs = api.state.tabsForContentTree;
    var selectedRuleType = api.state.selectedRuleType;
    var currentTabs = allTabs[selectedRuleType];
    if(!currentTabs.length) return;

    // Get the current tab from state slice selectedTabId
    var selectedTab = api.state.selectedTabId;
    var selectedTabIndex = currentTabs.findIndex(tab => tab['id'] == selectedTab);
    var selectedTab = currentTabs[selectedTabIndex];

    // Get next tab as well and update it to be selected
    var nextTab = currentTabs[selectedTabIndex + 1];
    api.setState("selectedTabId", nextTab.id);

    // Update status and disabled attribute on both tabs.
    selectedTab.statuses = [{"type": "icon", "icon": "circle-check-outline"}];
    selectedTab.disabled = false;
    nextTab.statuses = [{"type": "icon", "icon": "circle-semi-check-outline"}];
    nextTab.disabled = false;

    api.setState("tabsForContentTree", allTabs);
}
