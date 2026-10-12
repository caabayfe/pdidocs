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
        const listDividerPosition = event.payload.dividerPosition;
        const listPreference = api.state.listRatioPreference;
        
        api.setState('listDividerPosition', listDividerPosition);

        api.data.setListPreference.execute({
            'name': listPreference,
            'value': listDividerPosition
        });    
    }
}
