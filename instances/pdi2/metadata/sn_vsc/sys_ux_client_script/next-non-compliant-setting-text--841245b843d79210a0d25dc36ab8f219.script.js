/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const text = api?.data?.get_the_largest_impact_score_non_compliant_setting?.output?.what_next || '';
  return helpers.translateSync(text);
}
