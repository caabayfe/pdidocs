/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.fetch_collaboration_section_dropdown_choices.output && api.data.fetch_collaboration_section_dropdown_choices.output.length == 0) {
        return helpers.translateSync('No Chat/Call providers configured');
    } else {
        return '';
    }

}
