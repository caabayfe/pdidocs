/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        FormValidator
    } = imports["global.DMCFormValidator"]();
    
    const {
        isValid,
        formValidatorJson
    } = await FormValidator.validateState(api, helpers);

    if (!isValid) {
        return;
    }
    // Get the concerned tabs for the selected rule type.
    var allTabs = api.state.tabsForContentTree;
    var selectedRuleType = api.state.selectedRuleType;
    var currentTabs = allTabs[selectedRuleType];
    if(!currentTabs.length) return;

    // Get the current tab from state slice selectedTabId
    var selectedTab = api.state.selectedTabId;
    var selectedTabIndex = currentTabs.findIndex(tab => tab['id'] == selectedTab);
    if(selectedTabIndex < 1) return;
    var selectedTab = currentTabs[selectedTabIndex];

    // Get previous tab and update it to be selected
    var previousTab = currentTabs[selectedTabIndex - 1];
    api.setState("selectedTabId", previousTab.id);

    api.setState("tabsForContentTree", allTabs);
}
