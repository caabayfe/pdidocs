/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const progress = api.data.get_schema_alter_tracker_1.output?.progress1;
	return progress || 25;
}
