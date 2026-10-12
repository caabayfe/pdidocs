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
        DRAFT: 'warning',
        NEW: 'positive',
        PUBLISHED: 'info',
        RETIRED: 'critical',
    };
    if (projectDetails.status) {
        return statuses[projectDetails.status.value] || 'info';
    }
    return 'info';
}
