/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const taskType = api.context.props.taskType;
    return ((taskType && taskType.toUpperCase() != "COLLABORATIONTASKS") || !api.state.pageLoaded);
}
