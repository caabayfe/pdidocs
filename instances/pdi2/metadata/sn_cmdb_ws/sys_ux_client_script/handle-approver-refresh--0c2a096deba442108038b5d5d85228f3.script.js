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
    // debounce for 2 seconds so that even if there are multiple updates on the table, it only refreshes the list once
    helpers.timing.clearTimeout(api.state.refreshApprovalList?.refreshId);
    const refreshId = helpers.timing.setTimeout(() => {
        api.setState('refreshApprovalList', ({ currentValue }) => ({
            ...currentValue,
            timestamp: {
                ts: Date.now()
            }
        }));
    }, 2000);

    api.setState('refreshApprovalList', ({ currentValue }) => ({
        ...currentValue,
        refreshId
    }));
}
