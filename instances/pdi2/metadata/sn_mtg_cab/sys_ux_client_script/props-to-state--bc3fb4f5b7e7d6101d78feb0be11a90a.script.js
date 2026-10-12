/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    // Script: [User contact] Props to State

    if (!api.context.props.userData)
        return;

    if (api.context.props.userData.userEmail && `${api.context.props.userData.showEmail}` === 'true') {
        api.setState('userEmailLink', `mailto:${api.context.props.userData.userEmail}`);
        api.setState('hideEmail', false);
    } else
        api.setState('hideEmail', true);
}
