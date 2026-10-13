/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let sectionLabel = "";
    if (api.state.participantCollapse)
        sectionLabel = helpers.translateSync("Collapse participants list");
    else
        sectionLabel = helpers.translateSync("Expand participants list");
    return sectionLabel;
}
