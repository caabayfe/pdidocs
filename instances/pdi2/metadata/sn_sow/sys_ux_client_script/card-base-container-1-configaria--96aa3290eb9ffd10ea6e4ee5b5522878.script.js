/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const labelValue = api.item.value.request.displayValue + ": " + api.item.value.team_name.displayValue;
  return {
    "button": {
      "aria-label" : labelValue
    }
  };
}
