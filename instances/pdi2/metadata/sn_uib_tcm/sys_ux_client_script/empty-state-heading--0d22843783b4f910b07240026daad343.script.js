/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let errorState = api.state.errorState;
    var tabType = api.context.props.tabType;
    var label = "";
    if (errorState)
        label = helpers.translateSync("Unable to fetch communication information");
    else {
        if (tabType == "Communicate")
            label = helpers.translateSync("No communications yet");
        else if (tabType == "Collaborate")
            label = helpers.translateSync("No collaborations yet");
    }
    return {
        "label": label,
        "level": "3"
    };
}
