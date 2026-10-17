/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
	var autoSelected = api.data.intent_wise_topic_summary 
  && api.data.intent_wise_topic_summary.output 
  && api.data.intent_wise_topic_summary.output.AutoSelected
  && api.data.intent_wise_topic_summary.output.AutoSelected.items;
  var incorrect = api.data.intent_wise_topic_summary 
  && api.data.intent_wise_topic_summary.output 
  && api.data.intent_wise_topic_summary.output.Incorrect
  && api.data.intent_wise_topic_summary.output.Incorrect.items;
  var correct = api.data.intent_wise_topic_summary 
  && api.data.intent_wise_topic_summary.output 
  && api.data.intent_wise_topic_summary.output.Correct
  && api.data.intent_wise_topic_summary.output.Correct.items;
  return (!Array.isArray(autoSelected) || !autoSelected.length) && (!Array.isArray(incorrect) || !incorrect.length) &&  (!Array.isArray(correct) || !correct.length) ? true : false;
}
