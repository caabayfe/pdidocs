/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const columns = 'subscription,subscription_type,status,purchased_count,allocated_count';

	return api.context.props.shouldShowUnconfirmedUsers
    ? columns + ',unconfirmed_users'
    : columns;
}
