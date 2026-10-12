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
    var items = event.payload.name === 'agendaItems' ? event.payload.value : api.context.props.agendaItems;
    api.setState('agendaData', items);
}
