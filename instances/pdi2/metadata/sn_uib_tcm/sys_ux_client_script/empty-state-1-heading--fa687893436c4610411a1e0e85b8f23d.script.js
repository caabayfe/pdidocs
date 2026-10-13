/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const emptyStateType = api.state.emptyStateType;
    return {
        label: helpers.translateSync("No {0} channels left to be added", emptyStateType),
        level: 3
    };
}
