/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    if ((api.data.get_service_desk_agent_shift.output && api.data.get_service_desk_agent_shift.output.shiftText ) || api.state.metricText)
        return false;
    return true;
}
