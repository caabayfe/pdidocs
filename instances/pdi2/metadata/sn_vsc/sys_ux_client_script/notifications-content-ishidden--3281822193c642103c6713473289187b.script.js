/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api?.data?.get_notification_count?.output?.data?.GlideAggregate_Query[0]?.count > 0 ? false : true;
}
