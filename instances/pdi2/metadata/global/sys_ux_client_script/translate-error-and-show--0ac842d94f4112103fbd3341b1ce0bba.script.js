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
    var error = event.payload.errors[0];
    helpers.translate("Unable to complete performance analysis: '{0}'", error).then(label => {
    api.setState("dataFilterPerfMetrics", {"errors": label});
    });

}
