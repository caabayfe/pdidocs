/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let msg = helpers.translateSync("More actions for {0}", api.item.value.short_description.display_value);
  return { "trigger": { "aria-label": msg }};
}
