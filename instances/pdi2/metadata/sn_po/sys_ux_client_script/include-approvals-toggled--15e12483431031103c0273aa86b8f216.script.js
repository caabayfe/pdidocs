/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const entityForm = {...api.state.entityForm};
    entityForm.fields.includeApprovals.value = event.payload.value;
    api.setState('entityForm', entityForm);
}
