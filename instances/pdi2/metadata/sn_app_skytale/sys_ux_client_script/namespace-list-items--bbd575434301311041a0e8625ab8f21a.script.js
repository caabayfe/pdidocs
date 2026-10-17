/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let output = api.data && api.data.namespaces_list && api.data.namespaces_list.output || null;
  let list = output && output.data && output.data.GlideRecord_Query
  .sys_kafka_namespace._results || null;
  if (list === null) return [];
  let resultList = list.map((result) => ({id:result._row_data.uniqueValue, label:result.name.displayValue, sublabel:result.prefix.displayValue, value: result.prefix.value}));
  return resultList;
}
