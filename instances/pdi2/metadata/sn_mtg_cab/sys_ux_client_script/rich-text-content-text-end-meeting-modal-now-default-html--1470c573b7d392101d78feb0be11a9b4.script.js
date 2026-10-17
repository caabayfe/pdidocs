/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (!api.context.props.cabMeetingData)
      return;
  const meetingName = api.context.props.cabMeetingData.display_value;
  return helpers.translateSync("The <b>{0}</b> meeting will be marked as completed and can't be restarted.", [meetingName]);
}
