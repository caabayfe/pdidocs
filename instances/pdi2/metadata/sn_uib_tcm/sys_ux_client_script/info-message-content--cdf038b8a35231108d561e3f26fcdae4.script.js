/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const collabTaskDetails = api.state.collabTaskDetails;
    if (collabTaskDetails.channels && collabTaskDetails.channels.length > 0 && collabTaskDetails.channels[0].channelType && collabTaskDetails.channels[0].channelType.value === 'slack-channel-chat')
        return helpers.translateSync('Slack collaborations are only supported in the workbench.You can manage them there.');
}
