/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const projectTemplateDetails = {...api.state.projectTemplateDetails};
    projectTemplateDetails.isTemplate = event.payload.value === 'TEMPLATE';
    api.setState('projectTemplateDetails', projectTemplateDetails);
}
