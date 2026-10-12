/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const result = api.data[event.elementId].output.result || null;
    if (!result)
        return;

    const CABDataTransformer = imports['sn_mtg_cab.CABDataTransformer']();
    const CABAgendaPatching = imports['sn_mtg_cab.CABAgendaPatching']();
    const cabDataTransformer = new CABDataTransformer();
    const cabAgendaPatching = new CABAgendaPatching();

    let state = {
        activityStreamData: result.activityStreamData,
        agendaListTabs: result.agendaListTabs,
        attendeesControl: result.attendeesControl,
        emptyStates: result.emptyStateOptions,
        headerLabels: result.headerLabels,
        agenda: result.agenda,
        runtimeState: result.runtime_state,
        loading: ''
    };

    state = cabDataTransformer.requestMoreAgendaItems(state);
    state.notes = cabDataTransformer.notesHydration(result, api.context.session.user.sys_id);
    state.manager = cabDataTransformer.managerHydration(result.manager);
    state.attendees = cabDataTransformer.attendeeHydration(result.attendeesData.attendees);
    state.delegates = cabDataTransformer.delegatesHydration(result.delegates);
    state.meetingTimer = cabDataTransformer.meetingTimerHydration(result.runtime_state.cab_meeting.record, result.headerLabels);
    state.currentAgendaItem = cabDataTransformer.getCurrentAgendaItem(state, result);
    state.selectedAgendaItem = cabDataTransformer.getSelectedAgendaItem(state, result);
    state.isHost = cabDataTransformer.getIsHost(result, api.context);
    state.isDelegate = cabDataTransformer.getIsDelegate(result, api.context);
    state.nextAgendaItemId = cabDataTransformer.getNextAgendaItemId(result);

    // Finally, check empty state changes
    cabDataTransformer.updateMeetingEmptyState(state, api.context, helpers).then((newState) => {
        state = newState;
        Object.keys(state).forEach(
            propName => api.setState(propName, state[propName])
        );
    });

}
