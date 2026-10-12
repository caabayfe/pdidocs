/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        projectDetails
    } = api.state;
    const statuses = {
        AVAILABLE: 'positive',
        CANCELLED: 'low',
        ERROR: 'critical',
        MINING_DATA: 'high',
        SCHEDULED: 'low',
        NEW: 'positive',
    };
    if (projectDetails.state) {
        return statuses[projectDetails.state.value] || 'info';
    }
    return 'info';
}
