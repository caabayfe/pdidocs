/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.state.upgradeSessionType === 'bulk_app_update'
  ? helpers.translateSync("View imported plans and choose one, or select multiple plans to merge into a single plan. This helps you leverage existing plans, reduce rework, maintain accuracy, and streamline your update process.")
  : helpers.translateSync("View the imported plans to choose from or choose several plans and merge them into one. This is good for leveraging existing plans to reduce rework, maintain accuracy and streamline your upgrade process.");
}
