/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState('initial_view', event.payload.view);
    api.setState('compare_mode_on', false);
    if (api.state.isPlaybookProject) {
        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTab: api.state.TAB_ITEMS.PLAYBOOK_WORKBENCH,
            }
        });
    } else {
        api.emit("CONTENT_UPDATED", {
            params: {
                selectedTab: api.state.TAB_ITEMS.ANALYST_WORKBENCH,
            }
        });
    }
}
