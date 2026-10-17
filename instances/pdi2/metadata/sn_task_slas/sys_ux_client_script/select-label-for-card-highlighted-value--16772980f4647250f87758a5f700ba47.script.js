/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  var risk = 75;

  if (api.item.value.has_breached.value === true) {
    return "Breached";
  }
  else if (api.item.value.has_breached.value === false && api.item.value.business_percentage.value >= risk) {
    return "At Risk";
  }
  else if (api.item.value.has_breached.value === false && api.item.value.business_percentage.value < risk) {
    return "Ongoing";
  };
}
