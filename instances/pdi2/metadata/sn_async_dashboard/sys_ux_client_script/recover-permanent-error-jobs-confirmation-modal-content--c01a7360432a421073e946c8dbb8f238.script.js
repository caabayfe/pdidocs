/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	if (api.state.selectionCount > 1) {
    return 'If you recover them, it will set their state to “Ready” and they’ll run again.';
  } else {
    return 'If you recover, it will set the state to “Ready” and run again.';
  }
}
