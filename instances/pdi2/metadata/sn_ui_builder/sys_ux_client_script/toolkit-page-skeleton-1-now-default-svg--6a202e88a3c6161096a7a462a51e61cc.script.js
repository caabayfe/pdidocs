/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const showControllerElements = api.state.showControllerSelection;
  const isDarkMode = api.state.isDarkMode;

  if(isDarkMode && showControllerElements) {
    return '/sn_ui_builder.uib_controller_dark.svg';
  }
  else if (isDarkMode && !showControllerElements) {
    return '/sn_ui_builder.uib_page_collection_dark.svg';
  }
  else if(showControllerElements) {
    return '/sn_ui_builder.uib_controller.svg';
  }
  else {
    return '/sn_ui_builder.uib_page_collection.svg';
  }

}
