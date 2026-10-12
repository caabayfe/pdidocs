/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    api.setState('fetch_transitions_type_query', `model.sys_id=${api.context.props.modelDefinitionId}^track_change=false`);
}
