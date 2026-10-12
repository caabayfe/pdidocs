/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const userCount = api.context.props.unconfirmedUserNumber;
  return helpers.translateSync('{0} user(s) have consumed subscriptions that need to be reviewed.', userCount);
}
