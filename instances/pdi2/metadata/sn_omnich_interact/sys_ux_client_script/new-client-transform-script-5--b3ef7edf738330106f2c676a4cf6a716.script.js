/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const gFormHeader = api.data.gform.nowRecordCommonHeader;
  if (!gFormHeader)
    return true;

	return !gFormHeader.subHeadingValue
}
