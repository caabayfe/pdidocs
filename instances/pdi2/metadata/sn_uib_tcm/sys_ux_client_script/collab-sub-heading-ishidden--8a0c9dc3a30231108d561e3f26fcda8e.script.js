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
    const pageLoaded = api.state.pageLoaded;
    return ((taskType && taskType.toUpperCase() != "COLLABORATIONTASKS") || !pageLoaded);
}
