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
        const choiceFields = event.payload.data.output.data.GlideChoiceColumn_Query.getChoiceFields;

        const listItems = [];
        for (const field of choiceFields) {
            listItems.push({
                id: field.rawValue,
                label: field.displayValue,
            });
        }
        api.setState('fieldSelectValuesListItems', listItems);
        api.setState('activityValues', listItems);
}
