/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const users = JSON.stringify(api.state.selectedUsers.map(user => {
        return {
            sys_id: user.id
        };
    }));
    const linkToShare = api.context.props.sharedContent;
    const customMessage = api.state.message;

    api.data.share_via_email.execute({
        users: users,
        link_to_share: linkToShare,
        custom_message: customMessage
    });

    const pageTrackingData = api.context.props.trackingPayload || {};

    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'Share modal',
        value: {
            ...pageTrackingData,
            recipients: api.state.selectedUsers ? api.state.selectedUsers.length : 0,
            hasMessage: api.state.message ? true : false
        }
    });

}
