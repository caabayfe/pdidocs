/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    // Script: Event Handlers

    switch(event.name) {
        case 'NOW_INPUT#ENTER_KEYDOWN':
            api.emit('CAB_MEETING#SEARCH_ATTENDEES', {
                searchTerm: event.payload.fieldValue || '__firstInit'
            });
            break;
        case 'NOW_BUTTON_ICONIC#CLICKED':
            api.emit('CAB_MEETING#SEARCH_ATTENDEES', {
                searchTerm: event.elementId === 'button_iconic_clear_search_text' ? '__firstInit' : api.state.attendeeSearch.term
            });
            break;
        case 'NOW_DROPDOWN#ITEM_CLICKED':
            api.emit('CAB_MEETING#SORT_ATTENDEES', {
                item: event.payload.item
            });
            break;
        case 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET':
            api.emit('CAB_MEETING#PAGINATION_ATTENDEES', {
                value: event.payload.value
            });
            break;
    }
}
