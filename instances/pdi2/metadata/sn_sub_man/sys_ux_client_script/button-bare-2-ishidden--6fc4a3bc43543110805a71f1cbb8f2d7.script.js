/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { available_subs, over_allocated_subs } = api.state;
  const areFirstTwoInsightsShown = over_allocated_subs && (api.context.props.shouldShowUnconfirmedUsers && api.context.props.unconfirmedUserNumber > 0);
  const areSecondTwoInsightsShown = available_subs && (api.context.props.shouldShowUnconfirmedUsers && api.context.props.unconfirmedUserNumber > 0);
  const areLastTwoInsightsShown = over_allocated_subs && available_subs;
  // this should be hidden if just one insight is shown
  return !(areFirstTwoInsightsShown || areSecondTwoInsightsShown || areLastTwoInsightsShown);
}
