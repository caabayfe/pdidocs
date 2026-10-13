/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const dataFetchFailed = api.state.dataFetchFailed;
    const taskType = api.context.props.taskType;
    if (dataFetchFailed)
        return helpers.translateSync("An error occurred. Please contact your Admin for more information.");
    else if (taskType && taskType.toUpperCase() == 'COLLABORATIONTASKS')
        return helpers.translateSync("Start collaborating with your team to work towards a resolution.");
    else if (taskType && taskType.toUpperCase() == 'COMMUNICATIONTASKS')
        return helpers.translateSync("Create communication tasks to let users know about an ongoing major incident.");
    else
        return helpers.translateSync("Start a new communication from communicate tab. Navigate to the Collaborate side panel to start a new call or chat.");
}
