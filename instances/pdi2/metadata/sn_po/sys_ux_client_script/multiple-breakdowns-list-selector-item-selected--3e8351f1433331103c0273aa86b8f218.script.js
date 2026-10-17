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
    api.setState('listSelectorSelectedItems', event.payload);

    const multipleBreakdownsSelector = {...api.state.multipleBreakdownsSelector};
    multipleBreakdownsSelector.fields = [];

    for (const item of event.payload) {
        const dotwalkedFields = [];
        for (const field of item) {
            dotwalkedFields.push(field.id);
        }
        multipleBreakdownsSelector.fields.push(dotwalkedFields.join('.'));
    }

    api.setState('multipleBreakdownsSelector', multipleBreakdownsSelector);
}
