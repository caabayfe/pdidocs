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
    // content packs tab
    if (
        (event.elementId === 'tabs_2' && event.payload.selectedTabIndex === 1) ||
        (event.name === 'MACROPONENT_READY' && api.context.props.selectedTabIndex === 1)
     ) {
        api.setState('isContentPack', () => {
            return true;
        });
    } else {
        api.setState('isContentPack', () => {
            return false;
        });
    }
    api.setState('processConfigurationsList', () => {
        return {};
    });

    api.data.gliderecord_collection_query_1.refresh();
}
