/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { name } = event.payload;
    const { sidebarActiveTab } = api.state;
    if (name != sidebarActiveTab) {
        api.setState("sidebarActiveTab", name);
    }
}
