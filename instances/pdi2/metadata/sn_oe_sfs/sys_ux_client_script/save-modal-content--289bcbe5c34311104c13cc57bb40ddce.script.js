/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var inputs = api.state.inputs;
  const data = api.data.translations.output;
  if (api.state.showToggleModal) {
    return (data) ? data.sidebar_modal_deactivating_teams_integration : 'Deactivating will result in Sidebar discussions no longer being sent to or received by Teams.';
  } else {
    return (data) ? data.sidebar_modal_updating_setting : 'Updating settings could result in Sidebar discussions no longer being sent to or received by Teams.';
  }
}
