/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    // true - Hide | false - Show
    return !(api.context.props.shouldShowUnconfirmedUsers && (api.context.props.unconfirmedUserNumber > 0));
}
