/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const msg = helpers.translateSync('Instance level consumptions will not instantly update in the account summary.');
  return msg;
}
