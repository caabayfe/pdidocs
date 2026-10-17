/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const automatedFindingsCount = api.data.look_up_automated_finding_def?.results?.length || 0;
  const ruleBasedFindingsCount = api.data.look_up_finding_def?.results?.length || 0;
  const totalFindingsCount = Number(automatedFindingsCount) + Number(ruleBasedFindingsCount);

	return helpers.translateSync('Total applied: {0} • Rule based: {1} • Automated: {2}', totalFindingsCount, ruleBasedFindingsCount, automatedFindingsCount);
}
