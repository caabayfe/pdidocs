/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    
    switch (event.name) {
        case 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET':
            api.setState('currentFaqPageNumber',event.payload.value + 1);
            break;
        case 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET':
            api.setState('faqPageSize',event.payload.value);  
            api.setState('currentFaqPageNumber',1);
            break;
            
        default:
            break;
    }
    

}
