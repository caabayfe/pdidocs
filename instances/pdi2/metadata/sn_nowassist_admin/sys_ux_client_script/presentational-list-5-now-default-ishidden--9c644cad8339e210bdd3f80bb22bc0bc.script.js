/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api }) {
  return !(api?.state?.skillList?.length >0) && !(api?.state?.customSelectedItems?.length > 0);
 
}
