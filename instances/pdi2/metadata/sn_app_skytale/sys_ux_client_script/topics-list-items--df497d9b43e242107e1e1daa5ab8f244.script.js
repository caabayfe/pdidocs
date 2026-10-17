/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let output = api.data && api.data.kafka_topics_list && api.data.kafka_topics_list.output || null;
  let list = output && output.data && output.data.GlideRecord_Query
  .sys_kafka_topic._results || null;
  if (list === null) return [];
  let resultList = list.map(updateResults);
  function updateResults(result) {
    let topicName = "";
   if(result.full_name.displayValue.indexOf(":") > -1) {
    let attributes = result.full_name.displayValue.split(":");
    topicName = attributes[2].substring(4);
   } else {
    topicName = result.full_name.displayValue.substring(4);
   }
   return {id:result._row_data.uniqueValue, label:topicName, value:topicName};
  }
  return resultList;
}
