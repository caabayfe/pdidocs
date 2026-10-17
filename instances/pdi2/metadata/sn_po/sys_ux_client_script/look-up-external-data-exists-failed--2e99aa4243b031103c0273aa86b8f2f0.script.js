/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const entityForm = { ...api.state.entityForm
    };
    entityForm.fields.sourceType.listItems = entityForm.fields.sourceType.listItems.filter(item => item.id !== 'EXTERNAL_DATA');
    api.setState('entityForm', entityForm);
}
