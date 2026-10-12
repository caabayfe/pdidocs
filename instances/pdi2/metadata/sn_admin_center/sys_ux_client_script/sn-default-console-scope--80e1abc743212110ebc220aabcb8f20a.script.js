/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        scopes
    } = api.context.props;
    return scopes ? scopes.split(',') : [];
}
