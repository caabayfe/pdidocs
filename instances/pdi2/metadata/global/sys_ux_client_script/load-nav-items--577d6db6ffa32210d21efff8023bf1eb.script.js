/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    const {deepClone} = imports["global.DMClientScriptUtils"]();
    if (!api.state.tabsForContentTree) return;
    
    const stringsMap = {
        "Define your rule": await helpers.translate("Define your rule"),
        "Define conditions": await helpers.translate("Define conditions"),
        "Destroy archived records": await helpers.translate("Destroy archived records"),
        "Manage related records": await helpers.translate("Manage related records"),
        "Set additional actions": await helpers.translate("Set additional actions"),
        "Delete associated records": await helpers.translate("Delete associated records"),
        "Clean up associated records": await helpers.translate("Clean up associated records"),
        "Set up schedule": await helpers.translate("Set up schedule"),
        "View summary": await helpers.translate("View summary")
    };

    const {tabsForContentTree,selectedRuleType} = api.state;
    var tabs = deepClone(tabsForContentTree);
    for (const [ruleType, steps] of Object.entries(tabs)) {
      tabs[ruleType] = steps.map(step => ({...step, label:stringsMap[step.label]}));
    }
    api.setState("tabsForContentTree", tabs);
}
