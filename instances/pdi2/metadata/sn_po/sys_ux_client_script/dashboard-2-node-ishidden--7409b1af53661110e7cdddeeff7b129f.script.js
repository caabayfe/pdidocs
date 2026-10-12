/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    const selectedHeaderComponent = api.state.selectedHeaderComponent;
    return selectedHeaderComponent && selectedHeaderComponent === 'projectMetrics';
}
