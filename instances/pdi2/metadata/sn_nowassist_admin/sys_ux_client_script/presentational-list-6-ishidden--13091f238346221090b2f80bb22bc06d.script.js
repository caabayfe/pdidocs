/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api }) {
  return !api?.state?.showInstanceImpactCount && !(api?.state?.customSelectedItems?.length > 0);
}
