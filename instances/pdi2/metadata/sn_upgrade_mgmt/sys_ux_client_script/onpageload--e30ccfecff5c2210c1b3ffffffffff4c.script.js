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
    api.setState('sessionId', api.context.props.experienceProperties.session_id.displayValue);
    api.setState('sessionIdTemp', api.context.props.experienceProperties.session_id.displayValue);
    api.setState('tableFilter', `a_upgrade_session_idLIKE${api.context.props.experienceProperties.session_id.displayValue}`);

}
