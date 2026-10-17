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
    const propertyToViewportMap = {
        'announcements': {
            viewportElementId: 'viewport_xio',
            route: 'announcement'
        },
        'upcoming': {
            viewportElementId: 'viewport_usi',
            route: 'upcoming-task'
        },
        'quick_links': {
            viewportElementId: 'viewport_dbh',
            route: 'quick-link'
        }
    };

    if (sectionsVisibility && Object.keys(sectionsVisibility).length > 0) {
        for (const property in propertyToViewportMap) {
            let shouldEmitViewportLoadEvent = false;
            const isPropertyMissing = !sectionsVisibility.hasOwnProperty(property);
            const propertyValue = isPropertyMissing || sectionsVisibility[property];

            if (propertyValue && property === 'announcements' && api.state.showAnnouncements) {
                shouldEmitViewportLoadEvent = true;
            } else if (propertyValue) {
                shouldEmitViewportLoadEvent = true;
            }

            if (shouldEmitViewportLoadEvent) {
                api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                    ...propertyToViewportMap[property],
                    fields: null,
                    params: null
                });
            }
        }
    } else {
        for (const property in propertyToViewportMap) {
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                ...propertyToViewportMap[property],
                fields: null,
                params: null
            });
        }
    }
}
