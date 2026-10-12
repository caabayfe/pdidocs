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
    // Script: Request more agenda items
    if (!api.state.agendaListTabs.filters)
        return;
    const CABDataTransformer = imports['sn_mtg_cab.CABDataTransformer']();
    const cabDataTransformer = new CABDataTransformer();

    let state = JSON.parse(JSON.stringify(api.state));

    state = cabDataTransformer.requestMoreAgendaItems(state, event);
    Object.keys(state).forEach(
        propName => api.setState(propName, state[propName])
    );
}
