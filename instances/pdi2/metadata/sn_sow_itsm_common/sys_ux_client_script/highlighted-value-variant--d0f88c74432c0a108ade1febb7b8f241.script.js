/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var priority = api.item.value.priority;
  var highlightValues = api.data.get_incident_highlight_values.output;
  var condition = `priority=${priority}^EQ`;
  var variant = (priority && highlightValues && highlightValues[condition]) ? highlightValues[condition].variant : "";
  return variant;
}
