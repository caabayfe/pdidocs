/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const status = api.state.status;
    const {
        mode,
        postActionLink
    } = api.context.props.payload;
  
    return ['installing', 'updating'].includes(status) || (['installed','updated'].includes(status) && !postActionLink );
}
