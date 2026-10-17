/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const columns = 'subscription,subscription.subscription_type,subscription.start_date,subscription.end_date,status,subscription.purchased_count,allocated_count';

	return api.state.unconfirmed_user_flow_enabled
    ? columns + ',unconfirmed_user_count_display'
    : columns;
}
