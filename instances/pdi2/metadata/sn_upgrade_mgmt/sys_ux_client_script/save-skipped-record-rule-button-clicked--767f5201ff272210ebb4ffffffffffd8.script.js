/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const fieldNames = ['name', 'condition', 'action', 'user', 'tags', 'table', 'comment', 'order', 'active'];
    const formFields = api.data.record.form.fields;

    if (!formFields?.name?.value || !formFields?.condition?.value || !formFields?.action?.value || (formFields?.action?.value == '3' && !formFields?.user?.value) || (formFields?.action?.value == '4' && !formFields?.tags?.value)) return;
    
    const fields = fieldNames.reduce((result, fieldName) => {
        result[fieldName] = formFields[fieldName]?.value;
        return result;
    }, {});

    api.setState('skippedRecordRuleFields', fields);
    api.setState('showModalLoader', true);
    // helpers.modal.close("custom_1");
}
