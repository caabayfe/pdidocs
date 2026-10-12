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
    const data = api.data.fetch_source_types.output.data.GlideChoiceColumn_Query.getChoiceFields;
    const items = data.filter(choice => choice.rawValue !== "null").map(choice => ({
        id: choice.rawValue,
        label: choice.displayValue,
    }));
    const entityForm = { ...api.state.entityForm
    };
    entityForm.fields.sourceType.listItems = items;
    api.setState('entityForm', entityForm);
    api.data.look_up_external_data_exists.refresh();
}
