/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.get_customer_account_details_1.output && !api.data.get_customer_account_details_1.output.isProd;
}
