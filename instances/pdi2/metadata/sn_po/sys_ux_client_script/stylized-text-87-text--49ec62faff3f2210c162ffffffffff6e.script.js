/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { automatedFindingsIntro, automatedFindingForm } = api.state;
  return `: ${automatedFindingsIntro[automatedFindingForm.type.value] || ''}`;
}
