/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (!api.item.value.organiser || !api.item.value.organiser.displayName) return '';
  return helpers.translateSync('Organizer: {0}', api.item.value.organiser.displayName);
}
