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
    if (sectionsVisibility && ('quick_links' in sectionsVisibility)) {
        let showSection = api.data.get_sections_visibility_1.output.quick_links;
        return !showSection;
    } else {
        return false;
    }
}
