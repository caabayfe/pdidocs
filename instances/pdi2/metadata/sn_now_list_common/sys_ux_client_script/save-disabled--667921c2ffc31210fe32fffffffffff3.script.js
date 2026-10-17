/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
  function evaluateProperty({api, helpers}) {
    const title = api.data.controller.current.listTitle;
    const currentTitleValue = api.state.currentTitleValue;
    return !currentTitleValue.trim() || title === currentTitleValue;
  }
