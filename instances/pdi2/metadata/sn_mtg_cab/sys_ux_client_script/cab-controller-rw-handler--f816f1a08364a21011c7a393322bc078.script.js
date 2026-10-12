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
    // Script: CAB Controller - RW handler
    if (!event.payload.data || !event.payload.data.changes)
        return;

    const CABRecordWatcherHandler = imports['sn_mtg_cab.CABRecordWatcherHandler']();
    const cabRWHandler = new CABRecordWatcherHandler();

    const rwData = event.payload.data;
    const debounceTables = ['cab_meeting', 'cab_runtime_state', 'change_request', 'std_change_proposal', 'cab_agenda_item'];

    if (!debounceTables.includes(rwData.table_name)) {
        let updatedState = JSON.parse(JSON.stringify(api.state));

        if (rwData.table_name.includes('sysapproval_approver'))
            updatedState = cabRWHandler.approvalsChange(updatedState, rwData);
        
        // Update rest of the state properties
        updatedState = cabRWHandler.setNextAgendaItemId(updatedState);
        updatedState = cabRWHandler.setIsDelegate(updatedState, api.context);
        cabRWHandler.updateMeetingEmptyState(updatedState, api.context, helpers).then(newState => {
            Object.keys(newState).forEach(name => api.setState(name, newState[name]));
        });

        return;
    }

    const cabStorageKey = `sow_cab_data_${api.context.props.meetingId}`;
    helpers.timing.setTimeout(function() {
        const sessionStorage = this.window.sessionStorage;

        let storedData = sessionStorage.getItem(cabStorageKey);
        sessionStorage.removeItem(cabStorageKey);

        let oldTimer;
        let updateQueue;
        if (storedData) {
            storedData = JSON.parse(storedData);
            updateQueue = storedData.updateQueue;
            oldTimer = storedData.timer;
        }

        if (!updateQueue) {
            updateQueue = [];
        }

        // RW changes
        updateQueue.push(rwData);

        // Setup debounce which clears local storage
        if (oldTimer)
            helpers.timing.clearTimeout(oldTimer);
        const timer = helpers.timing.setTimeout(function() {
            sessionStorage.removeItem(cabStorageKey);

            let state = JSON.parse(JSON.stringify(api.state));

            updateQueue.forEach(rwData => {
                if (rwData.table_name === 'cab_meeting')
                    state = cabRWHandler.cabMeetingChange(state, rwData);

                if (rwData.table_name === 'cab_runtime_state')
                    state = cabRWHandler.cabRuntimeStateChange(state, rwData);

                if (rwData.changes.includes('host'))
                    state = cabRWHandler.hostChange(state, event, api.context);

                if (rwData.changes.includes('notes_editor') || rwData.changes.includes('meeting_notes'))
                    state = cabRWHandler.noteEditorChange(state, rwData, api.context);

                if (rwData.table_name === 'change_request' || rwData.table_name === 'std_change_proposal')
                    state = cabRWHandler.taskChange(state, rwData);

                if (rwData.table_name === 'cab_agenda_item')
                    state = cabRWHandler.agendaItemChange(state, rwData);

                // Update rest of the state properties
                state = cabRWHandler.setNextAgendaItemId(state);
                state = cabRWHandler.setIsDelegate(state, api.context);
            });
            // Finally, check empty state changes
            cabRWHandler.updateMeetingEmptyState(state, api.context, helpers).then(newState => {
                Object.keys(newState).forEach(name => api.setState(name, newState[name]));
            });

        }, 400);

        sessionStorage.setItem(
            cabStorageKey,
            JSON.stringify({
                updateQueue,
                lastUpdatedStorage: new Date().getTime(),
                timer
            })
        );
    });
}
