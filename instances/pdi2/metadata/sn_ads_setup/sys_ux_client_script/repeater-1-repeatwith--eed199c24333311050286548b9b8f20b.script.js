/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let external_links = api.context.props.experienceProperties.external_links.value;
    external_links = typeof external_links === 'string' ? JSON.parse(external_links) : external_links;
    return external_links;
}
