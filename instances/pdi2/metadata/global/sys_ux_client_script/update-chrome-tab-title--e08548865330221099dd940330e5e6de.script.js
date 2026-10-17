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

    // Emitting SCREEN_STATUS_CHANGED to update the title on page ready.
    api.emit('SCREEN_STATUS_CHANGED', {
        title: api.data.record_3.form.fields.name.displayValue
    });

}
