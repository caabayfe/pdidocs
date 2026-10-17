/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const {selectedActivityFieldDetails} = api.state;
	return selectedActivityFieldDetails && selectedActivityFieldDetails.internalType !== 'boolean';
}
