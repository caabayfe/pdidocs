/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let heading = {};
    const dataFetchFailed = api.state.dataFetchFailed;
    const taskType = api.context.props.taskType;
    if (dataFetchFailed)
        heading.label = helpers.translateSync("No results found");
    else if (taskType && taskType.toUpperCase() == 'COLLABORATIONTASKS')
        heading.label = helpers.translateSync("No collaborations due");
    else if (taskType && taskType.toUpperCase() == 'COMMUNICATIONTASKS')
        heading.label = helpers.translateSync("No communications due");
    else
        heading.label = helpers.translateSync("No pending items");
    heading.level = "3";
    return heading;
}
