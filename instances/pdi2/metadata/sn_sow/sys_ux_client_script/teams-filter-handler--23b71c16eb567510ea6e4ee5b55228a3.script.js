/**
 * Teams filter handler
 * 
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
    const payload = {
        name: event.name,
        elementId: event.elementId,
        payload: event.payload
    };
 
    if (event.name === 'NOW_DROPDOWN#SELECTED_ITEMS_SET') {
        const { items } = payload.payload;
        if (items && items[0]){
            api.setState('selectedFilterItem', payload.payload.items[0] );
        }
    } else if (event.name === 'MACROPONENT_READY') {
        const DEBOUNCE_THRESHOLD = 300;
        helpers.timing.setTimeout(() => {
            const { filters } = api.data.sow_team_management;
            if (filters && filters[0]){
                api.setState('selectedFilterItem', filters[0]);
            }
        }, DEBOUNCE_THRESHOLD);
    }
}
