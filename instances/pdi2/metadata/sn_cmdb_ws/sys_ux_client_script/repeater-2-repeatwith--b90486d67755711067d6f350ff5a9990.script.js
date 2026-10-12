/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api.context.props.template.most_related_items_merge_attributes)
    return api.context.props.template.most_related_items_merge_attributes.split(',');

	return [];
}
