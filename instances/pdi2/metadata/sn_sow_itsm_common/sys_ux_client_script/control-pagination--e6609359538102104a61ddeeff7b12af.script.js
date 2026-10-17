/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let recordsPerPage = api.state.recordsPerPage;
    if (event.elementId === "pagination_control_1") {
        api.setState('additionalCollaboratorsListIndex', event.payload.value);
    }
    if (api.state.allAdditionalCollaboratorsList.rows.length <= (event.payload.value + 1) * recordsPerPage) {
        api.setState('hideNextAndLastPageButton', true);
    } else {
        api.setState('hideNextAndLastPageButton', false);
    }
}
