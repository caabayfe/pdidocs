/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  if (api.state.job_classification || api.state.priority 
      || api.state.time_range_start && api.state.time_range_end) {
    return false;
  }
  
  if (!api.context.props.job && !api.context.props.priority 
      && !api.context.props.rangestart && !api.context.props.rangeend) {
    return true;
  }

	return false;
}
