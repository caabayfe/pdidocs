/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let sectionsVisibility = api.data.get_sections_visibility_1.output;
    if (sectionsVisibility && ('upcoming' in sectionsVisibility)) {
        let showSection = api.data.get_sections_visibility_1.output.upcoming;
        return !showSection;
    } else {
        return false;
    }
}
