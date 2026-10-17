/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Selected tab is received as `id=<tab_id>`
    const selectedTab = event.payload.selectedTab;
    // Update prop value when tab navigation occurs.
    // make playbook workbench as default tab selection for playbook projects.
    if (api.state.isPlaybookProject) {
        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTab: api.state.TAB_ITEMS.PLAYBOOK_WORKBENCH,
            }
        });
        return;
    }
    // prevents the default tab selection to SUMMARY_AND_INSIGHTS
    // tab selection should process through `Promin findings fetched` script, when project is opening 
    if (!event.payload.isInitialPageLoad) {
        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTab: selectedTab.substring(selectedTab.indexOf('id=') + 3) || api.state.TAB_ITEMS.SUMMARY_AND_INSIGHTS,
            }
        });
    }
}
