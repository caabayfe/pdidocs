/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {
    attributeCheckedState
  } = api.state;

  const attributeKeys = Object.keys(attributeCheckedState);
  if (attributeKeys.some(key => attributeCheckedState[key]))
    return helpers.translateSync("Comment for selected field(s)");

  return helpers.translateSync("Comment for selected record(s)");
}
