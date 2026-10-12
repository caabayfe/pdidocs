/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let { currentPage, offset } = api.state;
    let elementId = event.elementId;
    let searchResultsPerPage = api.context.props.searchResultsPerPage; 
    api.setState('offset', elementId == 'next_btn' ? offset + searchResultsPerPage : offset - searchResultsPerPage);
    api.setState('currentPage', elementId == 'next_btn' ? currentPage + 1 : currentPage - 1);
}
