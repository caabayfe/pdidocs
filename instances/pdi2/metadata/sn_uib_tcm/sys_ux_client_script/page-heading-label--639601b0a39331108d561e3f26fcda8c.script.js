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
    if (taskType && taskType.toUpperCase() == 'COLLABORATIONTASKS')
        return helpers.translateSync("You can view all collaborations and start new ones in the collaborate side panel.");
    else if (taskType && taskType.toUpperCase() == 'ADHOCTASKS')
        return helpers.translateSync("These are created separately from the pre-defined communication/ collaboration plans.");
    else
        return helpers.translateSync("You can view all communications and create new ones in the communicate tab.");
}
