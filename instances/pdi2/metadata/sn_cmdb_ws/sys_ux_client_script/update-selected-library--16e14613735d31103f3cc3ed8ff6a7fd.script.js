/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var library = event.payload.value;
    api.setState('selectedLibrary', library);

    // if they select the none state library, disable everything
    // and reset template selection
    api.setState('templateSelectionDisabled', library == 'none');
    api.setState('isLibrarySelectionValid', library != 'none');
    if (library == 'none') {
        api.setState('selectedTemplate', 'none');
    }
}
