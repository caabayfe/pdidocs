/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Script: Patch in more agenda items
    const CABAgendaPatching = imports['sn_mtg_cab.CABAgendaPatching']();
    const cabAgendaPatching = new CABAgendaPatching(api.state.agendaListTabs.paginationRecordsPerPage);

    const newAgendaItems = cabAgendaPatching.hydrateTimers(api.data.get_cab_agenda_item.output.result);
    let agenda = api.state.agenda;
    if (!agenda) {
        const rawAgenda = JSON.parse(JSON.stringify(api.data.get_cab_initial_load.output.result.agenda));
        agenda = {
            ...rawAgenda,
            agenda: cabAgendaPatching.hydrateTimers(rawAgenda.agenda)
        };
    }
    const filter = api.state.agendaListTabs.filter;
    const pageNum = api.state.agendaPageNum;
    const newAgendaState = cabAgendaPatching.patchStateWithAgenda(agenda, newAgendaItems, filter, pageNum);

    const emptyStates = ['canceled', 'complete'];
    if (!emptyStates.includes(api.state.runtimeState.cab_meeting.record.state.value) && newAgendaState.agenda && newAgendaState.agenda.length > 0)
        api.setState('runtimeState', Object.assign({}, api.state.runtimeState, { emptyState: {} }));

    api.setState('agenda', newAgendaState);
}
