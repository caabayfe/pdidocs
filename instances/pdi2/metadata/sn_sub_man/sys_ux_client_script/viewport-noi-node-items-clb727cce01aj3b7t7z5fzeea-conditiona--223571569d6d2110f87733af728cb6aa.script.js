/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.data.sub_ent_record.result.subscription_type.value == 0 || api.data.sub_ent_record.result.subscription_type.value == 2)
	  return false ;
  return true;
}
