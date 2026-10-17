/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const columns = 'subscription,subscription_type,start_date,end_date,status,purchased_count,allocated_count';
  const isUnconfirmedUserFlowEnabled = (api.context.props.shouldShowUnconfirmedUsers === true || api.context.props.shouldShowUnconfirmedUsers === "true");
  // If the unconfirmed user flow is enabled, add the unconfirmed_user_count_display column
  return isUnconfirmedUserFlowEnabled  ? columns + ',unconfirmed_user_count_display' : columns;

}
