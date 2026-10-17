/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	var array = api.data.intent_wise_topic_summary 
  && api.data.intent_wise_topic_summary.output 
  && api.data.intent_wise_topic_summary.output.AutoSelected
  && api.data.intent_wise_topic_summary.output.AutoSelected.items;
  return Array.isArray(array) && array.length ? false : true;
}
