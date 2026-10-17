/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data?.aggregation_query_1?.output?.data?.GlideAggregate_Query?.[0]?.count || 0;
}
