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
    if (!event.payload.table) {
        const entityForm = { ...api.state.entityForm };
        if (api.state.isPlaybookSourceTypeProject) {
            const conditions = api.state.playbookProjectFixedFilters;
            // join previous applied filters + condition builder filters
            entityForm.fields.filter.value = `${conditions}^${event.payload.value}`;
        } else {
            entityForm.fields.filter.value = event.payload.value;
        }
        api.setState('entityForm', entityForm);
    }
}
