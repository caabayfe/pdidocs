/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return !(api.state.userDetails && api.state.userDetails.email && api.data.check_ms_teams_configured_for_agent_popover.output);
}
