/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var disabled = api.data.nowassistadminuser_1.output || false;
  var editTranslate = helpers.translateSync("Edit");
  var exportTranslate = helpers.translateSync("Export");
	return [{"id":"edit","label":editTranslate,"disabled": disabled},{"id":"export","label":exportTranslate,"disabled": disabled}];
}
