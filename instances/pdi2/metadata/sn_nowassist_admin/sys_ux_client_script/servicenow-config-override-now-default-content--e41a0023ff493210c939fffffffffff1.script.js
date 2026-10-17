/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return helpers.translateSync('There exists a default Servicenow configuration for "{0}". Adding a new configuration will override the default one.', api.state.currentEditingVersion?.sourceModel);
}
