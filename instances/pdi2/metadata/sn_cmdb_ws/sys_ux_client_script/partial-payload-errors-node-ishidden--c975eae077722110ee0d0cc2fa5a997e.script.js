/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var count = 0;
  if (api.data.get_partial_payload_item_count.output?.data?.GlideAggregate_Query) {
    count = parseInt(api.data.get_partial_payload_item_count.output.data.GlideAggregate_Query[0].count);
  }
	return !(count > 0);
}
