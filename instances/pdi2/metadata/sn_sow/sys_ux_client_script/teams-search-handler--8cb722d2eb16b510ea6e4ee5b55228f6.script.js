/**
 * Teams Search Handler
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
   
    if (event.name === 'SN_SEARCH_COMBOBOX#SEARCH_EXECUTED') {
        const { searchTerm } = payload.payload;
        api.setState('searchTerm', searchTerm );
    }
}
