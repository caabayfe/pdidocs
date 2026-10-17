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
     api.emit('NAV_ITEM_SELECTED', {
        route: 'analytics-source-duplicate',
        title: event.payload.analyticsSourceNewName,
        fields: {
            sysId: event.payload.analyticsSourceSysId,
        },
        params: {
            duplicationInfo: {
                 analyticsSourceName: event.payload.analyticsSourceNewName,
                 analyticsSourceDescription: event.payload.analyticsSourceNewDescription
            }
        }
    });
}
