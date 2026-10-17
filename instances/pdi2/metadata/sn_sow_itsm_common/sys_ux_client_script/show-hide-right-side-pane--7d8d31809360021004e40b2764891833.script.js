/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const sectionsVisibility = api.data.get_sections_visibility_1.output;
    const propertiesToCheck = ['announcements', 'upcoming', 'quick_links'];
    if (sectionsVisibility && Object.keys(sectionsVisibility).length > 0) {
        const allPropertiesPresent = propertiesToCheck.every(property => {
            if (property === 'announcements' && !sectionsVisibility.hasOwnProperty('announcements')) {
                return !api.state.showAnnouncements;
            }
            return sectionsVisibility.hasOwnProperty(property);
        });
        const propertyValues = Object.entries(sectionsVisibility).some(([property, value]) => {
            if (property === 'announcements' && value) {
                return api.state.showAnnouncements;
            }
            return value;
        });
        api.setState('hideRightPanel', allPropertiesPresent && !propertyValues);
    } else {
        api.setState('hideRightPanel', false);
    }
}
