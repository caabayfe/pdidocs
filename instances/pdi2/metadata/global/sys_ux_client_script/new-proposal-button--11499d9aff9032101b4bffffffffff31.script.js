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
    //Only close tab if the experience is tabbed
    if (api.context.props.tabbedExperience && api.context.props.tabbedExperience + '' === 'true')
        api.emit('SCREEN_STATUS_CHANGED', {status: 'closed', skipNextScreenActivation: true});
    const params = {};
    const fields = {
        "table": "std_change_proposal",
        "sysId": "-1"
    };
    helpers.navigate.to("record", fields, params);
}
