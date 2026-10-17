/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { payload} = event;
    const { sidebarActiveTab } = api.state;
    if(payload.selectedTabIndex != sidebarActiveTab) {
        api.setState("previousActiveTab",sidebarActiveTab);
    }
    api.setState("sidebarActiveTab", payload.selectedTabIndex);
}
