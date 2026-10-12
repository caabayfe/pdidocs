/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return helpers.translateSync('These groups have relevant roles that can use this product. Choose the groups you want to allocate subscriptions to.');
}
