/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const {output} = api.data.gliderecord_collection_query_1;
  if (output.data.GlideRecord_Query.sys_db_object._results.length > 0) {
    return output.data.GlideRecord_Query.sys_db_object._results[0].label.value;
  }

  return '';
}
