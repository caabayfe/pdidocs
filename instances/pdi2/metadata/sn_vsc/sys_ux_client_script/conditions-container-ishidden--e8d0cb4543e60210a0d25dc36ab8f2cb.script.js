/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const displayOff = api?.item?.value?.displayOff;
  if (displayOff == true || displayOff == undefined) {
    return true;
  } else {
    return false;
  }
}
