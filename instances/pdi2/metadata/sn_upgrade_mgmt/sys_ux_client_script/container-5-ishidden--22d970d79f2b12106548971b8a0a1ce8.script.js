/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !(api.state.playbookState === 'PLAYBOOK_NOT_STARTED' && api?.state?.releasedCardsRepeaterData?.length > 0) || api.state.loading;
}
