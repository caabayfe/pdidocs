/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (!api.state.confDetails.organiser || !api.state.confDetails.organiser.displayName) return '';
  return helpers.translateSync('Organizer: {0}', api.state.confDetails.organiser.displayName);
}
