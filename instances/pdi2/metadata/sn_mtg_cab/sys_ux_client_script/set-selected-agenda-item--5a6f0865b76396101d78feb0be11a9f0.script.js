/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Script: Set Selected Agenda Item
    if (!api.data.get_cab_initial_load.output?.result?.agenda?.agenda)
        return;

    let selectedAgendaItemSysID = '';
    switch (event.name) {
        case 'DATA_FETCH_SUCCEEDED':
            selectedAgendaItemSysID = api.data.get_cab_initial_load.output.result.runtime_state.current_agenda_item.value;
            break;
        case 'CAB_MEETING_CTRL#AGENDA_ITEM_CARD_SELECTED':
            selectedAgendaItemSysID = event.payload.sysId;
            break;
    }

    const agenda = api.state.agenda?.agenda || api.data.get_cab_initial_load.output.result.agenda.agenda;
    let selectedAgendaItem = agenda.find((a) => {
        return a.sys_id.value === selectedAgendaItemSysID;
    });

    if (!selectedAgendaItem)
        selectedAgendaItem = api.data.get_cab_initial_load.output.result.agenda.agenda[0];

    api.setState('selectedAgendaItem', selectedAgendaItem);
    if (selectedAgendaItem && Object.keys(selectedAgendaItem).length > 0) {
        const runtimeState = JSON.parse(JSON.stringify(api.state.runtimeState));
        runtimeState.emptyState = null;
        api.setState('runtimeState', runtimeState);
    }
}
