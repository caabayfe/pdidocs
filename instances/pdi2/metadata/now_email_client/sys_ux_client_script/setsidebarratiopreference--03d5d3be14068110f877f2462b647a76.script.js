/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
        const {sidebarRatio, sidebarRatioPreference} = event.payload;
        api.setState('sidebarRatioSaved', sidebarRatio);
        api.data.setSidebarRatioPreference.execute({
            'name': sidebarRatioPreference,
            'value': sidebarRatio
        });
    
}
