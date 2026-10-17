/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.state.bestPracticesAffectedData) {
    if (api.state.bestPracticesAffectedData.hasBestPracticesChanged) {
      return helpers.translateSync("Continue your progress");
    } else {
      return helpers.translateSync("Get started with Best Practices");
    }
  }
}
