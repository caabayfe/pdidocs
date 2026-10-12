/**
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
    const entityForm = { ...api.state.entityForm
    };
    entityForm.fields.relationField.selectedValue = event.payload.value;
    entityForm.fields.relationField.invalid = false;
    api.setState('entityForm', entityForm);
}
