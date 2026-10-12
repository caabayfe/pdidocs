/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var isSame = function(state, prop) {
    if (state) {
      if (prop != state) {
        return false;
      }
    }
    return true;
  };
  
  if (!isSame(api.state.job_classification, api.context.props.job)) {
    return false;
  }
  
  if (!isSame(api.state.priority, api.context.props.priority)) {
    return false;
  }
  
  if (!isSame(api.state.time_range_start, api.context.props.rangestart)) {
    return false;
  }
  
  return isSame(api.state.time_range_end, api.context.props.rangeend);
}
