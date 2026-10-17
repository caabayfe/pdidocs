/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.context.props.selectedTab && api.context.props.selectedTab.indexOf("scheduled_jobs") !== -1) {
    return "id=scheduled_jobs";
  } else {
    return "id=system_event_monitoring";
  }
}
