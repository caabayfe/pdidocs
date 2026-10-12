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
    if (sectionsVisibility && ('announcements' in sectionsVisibility)) {
        let showSection = api.data.get_sections_visibility_1.output.announcements;
        return showSection ? !api.state.showAnnouncements : !showSection;
    } else {
        return !api.state.showAnnouncements;
    }
}
