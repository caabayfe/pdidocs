/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { available_subs, over_allocated_subs } = api.state;
  const areBothInsightsShown = over_allocated_subs && (api.context.props.shouldShowUnconfirmedUsers && api.context.props.unconfirmedUserNumber > 0);
  // this should be hidden if both insights are shown
  return areBothInsightsShown || !Boolean(available_subs);
}
