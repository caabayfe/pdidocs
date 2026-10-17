/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
async function evaluateProperty({
    api,
    helpers
}) {
    return await helpers.translate('The custom dashboard may or may not match the data defined in project scope');
}
