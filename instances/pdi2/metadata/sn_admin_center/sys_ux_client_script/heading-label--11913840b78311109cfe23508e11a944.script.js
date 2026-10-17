/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const shareLabel = helpers.translateSync('Share this');
    const heading = api.context.props.heading ? api.context.props.heading.toLocaleLowerCase() : '';
    return `${shareLabel} ${heading}`;
}
