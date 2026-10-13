/**
  * @param {params} params 
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var expanded = api.item.value.expanded;
  if (expanded)
    return helpers.translateSync("Collapse {0}", api.item.value.displayName);
  else 
    return helpers.translateSync("Expand {0}", api.item.value.displayName);
}
