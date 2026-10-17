/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const msg = helpers.translateSync(' It may take up to 48 hours for the data synchronization process to complete.');
	return msg;
}
