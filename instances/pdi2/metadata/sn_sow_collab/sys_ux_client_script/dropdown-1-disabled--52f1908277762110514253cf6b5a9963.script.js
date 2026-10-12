/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.fetch_collaboration_section_dropdown_choices.output) {
        return api.data.fetch_collaboration_section_dropdown_choices.output.length == 0;
    }
}
