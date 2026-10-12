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

    if (api.context.props.fields.major_incident_state && api.context.props.fields.major_incident_state.value === 'accepted') {
        api.setState('isMajorIncident', true);
        api.data.get_active_conferences_1.refresh();
    }
}
