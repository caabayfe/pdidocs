/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const slas = api.data.gliderecord_collection_query_1.output.data.GlideRecord_Query.task_sla._results || [];
  const breachedCount = slas.filter(sla => sla?.has_breached?.value === true).length;
  
	return api.context.props.collapsed || (breachedCount === 0);
}
