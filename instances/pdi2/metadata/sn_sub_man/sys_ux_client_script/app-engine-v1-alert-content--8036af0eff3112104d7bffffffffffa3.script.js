/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const message = helpers.translateSync("App Engine V1 subscriptions aren't viewable on this page.  You can manage your App Engine V1 subscriptions by navigating to this dashboard: ");
  return message;
}
