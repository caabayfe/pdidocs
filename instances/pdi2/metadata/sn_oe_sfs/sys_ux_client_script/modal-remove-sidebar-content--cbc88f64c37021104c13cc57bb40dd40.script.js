/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const toggleValue = api.state.toggleValue;
  const data = api.data.translations.output;
  if (toggleValue === false) {
    return (data) ? data.sidebar_modal_button_disabled : 'If Sidebar is turned off, Teams integration will also be turned off.';
  } else {
    return (data) ? data.sidebar_modal_button_enabled : 'If Sidebar is turned on, Teams integration must be manually turned on.';
  }
}
