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
    if (api.data.fetch_collaboration_section_dropdown_choices.output && api.data.fetch_collaboration_section_dropdown_choices.output.length == 0) {
        sectionLabel = helpers.translateSync('Chat/Call providers are either not properly configured or you do not have the required roles.');
    } else {
        sectionLabel = helpers.translateSync('Initiate collaboration');
    }
    return {
        "trigger": {
            "aria-label": sectionLabel
        },
        "button": {
            "aria-label": sectionLabel
        }
    };

}
