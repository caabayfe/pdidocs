/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Hide Mine Project button if project type is Template or if project cannot be mined
    return (
        api.data?.is_template?.result?.is_template?.value ||
        !api.state.projectData.canMine
    );
}
