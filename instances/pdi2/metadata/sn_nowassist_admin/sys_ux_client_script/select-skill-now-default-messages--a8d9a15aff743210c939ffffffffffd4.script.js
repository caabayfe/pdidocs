/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const hasMaint = api.context.session.user.roles.includes('maint');
    const hasEditAccess = api.state.hasEditAccess;
    if (hasEditAccess && !hasMaint && api.item.value.warning && (api.item.value.errorType === "CONFLICTING_TARGET" || api.item.value.errorType === "DUPLICATE")) {
        return [{
            "status": "critical",
            "icon": "triangle-exclamation-outline",
            "content": "Please select a different skill.",
        }]
    }
}
