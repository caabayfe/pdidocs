/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const choiceFields = api.data.get_activity_type_choice_fields.output.data.GlideChoiceColumn_Query.getChoiceFields;
    const listItems = [];
    for (const field of choiceFields) {
        listItems.push({
            id: field.rawValue,
            label: field.displayValue,
        });
    }
    let activityForm = {...api.state.activityForm};
    activityForm.fields.type.listItems = listItems.slice(1); // remove empty option
    api.setState('activityForm', activityForm);
}
