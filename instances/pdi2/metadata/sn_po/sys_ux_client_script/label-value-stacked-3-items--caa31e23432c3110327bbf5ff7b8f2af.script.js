/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const statuses = {
        DRAFT: 'warning',
        NEW: 'positive',
        PUBLISHED: 'info',
        RETIRED: 'critical',
    };
    const projectStatus = api.state?.projectData?.status?.label;
    return [{
        "label": helpers.translateSync("Project Status"),
        "value": [{
            "label": projectStatus,
            "type": "highlighted-value",
            'color': statuses[api.state?.projectData?.status?.value] || 'info',
        }]
    }];
}
