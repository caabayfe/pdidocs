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
    if (event.payload.interaction === "USER_ACTION") {
        const sidebarRatio = event.payload.dividerPosition;
        const sidebarRatioPreference = api.state.sidebarRatioPreference;

        api.setState('sidebarRatioSaved', sidebarRatio);

        api.data.setSidebarRatioPreference.execute({
            'name': sidebarRatioPreference,
            'value': sidebarRatio
        });
    }
}
