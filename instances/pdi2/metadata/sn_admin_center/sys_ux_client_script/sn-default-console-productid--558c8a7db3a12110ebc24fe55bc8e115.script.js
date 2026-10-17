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
        product
    } = api.context.props;
    return product ? product : '';
}
