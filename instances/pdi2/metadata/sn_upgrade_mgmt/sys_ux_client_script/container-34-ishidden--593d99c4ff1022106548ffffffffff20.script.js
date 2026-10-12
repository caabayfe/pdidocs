/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return !(api.state.playbookState === 'PLAYBOOK_IN_PROGRESS') || api.state.loading;
}
