/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const data = api.data.translations.output;
	if (api.state.showToggleModal) {
    return (data) ? data.sidebar_modal_button_deactivate : 'Deactivate';
  } else {
    return (data) ? data.sidebar_modal_button_update : 'Update';
  }
}
