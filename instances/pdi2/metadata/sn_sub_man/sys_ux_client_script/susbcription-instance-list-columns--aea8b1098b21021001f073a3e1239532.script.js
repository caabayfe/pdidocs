/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.data.get_customer_account_details_1.output.capacityType === 'Dedicated') {
  return 'instance , instance_type, instance_purpose ,last_updated,used_capacity,used_pool_capacity ';
  }
  else
  {
    return 'instance , instance_type, instance_purpose ,last_updated,used_capacity,included_capacity , used_pool_capacity ';
  }
}
