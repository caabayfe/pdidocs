function include({
    imports
}) {
    class CABRecordWatcherHandlerSNC {
        constructor() {}

        cabRuntimeStateChange(state, watcherData) {
            let runtimeState = state.runtimeState;

            runtimeState = {
                ...runtimeState,
                ...watcherData.record
            };

            if (watcherData.changes.includes('current_agenda_item')) {
                if (watcherData.record.current_agenda_item !== '') {
                    state.currentAgendaItem = state.agenda.agenda.find( item => item.sys_id.value === watcherData.record.current_agenda_item.value);
                } else
                    state.currentAgendaItem = null;
            }

            return {
                ...state,
                runtimeState
            };
        }

        cabMeetingChange(state, watcherData) {
            const runtimeState = state.runtimeState;
            const cabMeeting = runtimeState.cab_meeting;
            runtimeState.cab_meeting = Object.assign(cabMeeting, {
                record: Object.assign(cabMeeting.record, watcherData.record),
                display_value: watcherData.record?.name?.display_value || cabMeeting.display_value
            });

            const CABDataTransformer = imports['sn_mtg_cab.CABDataTransformer']();
            const cabDataTransformer = new CABDataTransformer();
            const meetingTimer = cabDataTransformer.meetingTimerHydration(runtimeState.cab_meeting.record, state.headerLabels, true);

            return Object.assign(state, {runtimeState, meetingTimer});
        }

        agendaItemChange(state, watcherData) {
            const sysId = watcherData.sys_id;
            if (watcherData.changes.includes('task') && !watcherData.operation.includes('insert') && !watcherData.action.includes('entry'))
                return Object.assign(state, {
                    agendaItemsToFetch: this._mergeToFetch(state.agendaItemsToFetch, sysId),
                    timestamp: Date.now()
                });

            const agenda = state.agenda;
            let runtimeState = state.runtimeState;
            let selectedAgendaItem = state.selectedAgendaItem;
            let currentAgendaItem = state.currentAgendaItem;
            const initialListTabs = state.agendaListTabs;
            const CABAgendaPatching = imports['sn_mtg_cab.CABAgendaPatching']();
            const cabAgendaPatching = new CABAgendaPatching(initialListTabs.paginationRecordsPerPage);
            const filter = initialListTabs.filter;
            const pageNum = state.agendaPageNum || 1;
            let actionMatched = false;
            if (watcherData.operation.includes('delete') && watcherData.action?.includes('exit')) {
                actionMatched = true;
                agenda.agenda = cabAgendaPatching.removeDeletedAgendaFromList(agenda.agenda, sysId);
                agenda.nriState = cabAgendaPatching.removeAgendaItemsFromNri(agenda.nriState, [{
                    sys_id: {
                        value: sysId
                    }
                }]);
            }
            if (watcherData.operation.includes('insert') && watcherData.action.includes('entry'))
                return Object.assign(state, {
                    agendaItemsToFetch: this._mergeToFetch(state.agendaItemsToFetch, sysId)
                });
            if (watcherData.operation.includes('update') && watcherData.action.includes('change')) {
                actionMatched = true;
                agenda.agenda = cabAgendaPatching.updateAgendaWithWatcherRecord(agenda.agenda, watcherData);
                const nextAgendaItem = cabAgendaPatching.getCurrentAgendaItem(agenda.agenda, state.currentAgendaItem, watcherData);

                if (nextAgendaItem) {
                    currentAgendaItem = nextAgendaItem;
                    selectedAgendaItem = nextAgendaItem;
                } else {
                    currentAgendaItem = null;
                    selectedAgendaItem = null;
                }
            }
            if (!actionMatched)
                return state;
            const {
                totalCount,
                currentPage
            } = cabAgendaPatching.getCurrentPageAndCount(agenda.agenda, agenda.nriState, filter, pageNum);
            if (!state.currentAgendaItem)
                state.selectedAgendaItem = state.agenda.currentPageData[0];


            agenda.totalFilteredAgenda = totalCount;
            agenda.currentPageData = currentPage;
            return state = Object.assign(state, {
                agenda,
                runtimeState,
                currentAgendaItem,
                selectedAgendaItem
            });
        }

        taskChange(state, watcherData) {
            const agenda = state.agenda;
            if (!agenda.agenda || !watcherData.operation.includes('update') || !watcherData.action.includes('change'))
                return state;
            const sys_id = watcherData.sys_id;
            const selectedAgenda = state.selectedAgendaItem;
            const initialListTabs = state.agendaListTabs;
            const CABAgendaPatching = imports['sn_mtg_cab.CABAgendaPatching']();
            const cabAgendaPatching = new CABAgendaPatching(initialListTabs.paginationRecordsPerPage);
            const filter = initialListTabs.filter;
            const pageNum = state.agendaPageNum || 1;


            cabAgendaPatching.updateTaskRecordWithWatcherData(agenda.agenda, watcherData);

            const matchingAgenda = agenda.agenda.filter(({
                task: {
                    value
                }
            }) => value === sys_id)[0];

            if (matchingAgenda) {
                if (matchingAgenda.state.value === 'in_progress' || matchingAgenda.state.value === 'paused')
                    state = {
                        ...state,
                        'currentAgendaItem': {
                            ...state.currentAgendaItem,
                            ...matchingAgenda
                        }
                    };

                if (selectedAgenda && matchingAgenda.sys_id.value === selectedAgenda.sys_id.value)
                    state = {
                        ...state,
                        'selectedAgendaItem': matchingAgenda
                    };
            }

            const {
                totalCount,
                currentPage
            } = cabAgendaPatching.getCurrentPageAndCount(agenda.agenda, agenda.nriState, filter, pageNum);

            agenda.totalFilteredAgenda = totalCount;
            agenda.currentPageData = currentPage;

            return {
                ...state,
                agenda
            };

        }

        hostChange(state, event, context) {
            const runtimeState = state.runtimeState;
            const record = event.payload.data.record;

            for (const field in record)
                runtimeState[field] = record[field];

            const isHost = context.session.user.sys_id === runtimeState?.host?.value;

            // Update manager data
            const manager = state.manager;
            manager.showHost = runtimeState?.host?.value === manager.userSysId;

            // Update delegates data
            const delegates = state.delegates;
            delegates.forEach(delegate => {
                delegate.showHost = runtimeState?.host?.value === delegate.userSysId;
            });

            return {
                ...state,
                isHost,
                manager,
                runtimeState,
                delegates
            };
        }

        noteEditorChange(state, rwData, context) {
            const runtimeState = state.runtimeState;

            // Patch the data
            const param = rwData.changes[0];
            const obj = rwData.record[param];
            for (const field in obj) {
                if (param === 'meeting_notes') 
                    runtimeState.cab_meeting.record[param][field] = obj[field];
                else if (runtimeState[param] && runtimeState[param][field])
                    runtimeState[param][field] = obj[field];
            }

            const data = {};
            data.runtime_state = runtimeState;
            data.manager = state.manager;
            data.delegates = state.delegates;

            const CABDataTransformer = imports['sn_mtg_cab.CABDataTransformer']();
            const cabDataTransformer = new CABDataTransformer();
            const notes = cabDataTransformer.notesHydration(data, context.session.user.sys_id);
            notes.lastUpdatedBy = rwData.record?.sys_updated_by?.display_value || '';

            return Object.assign({}, state, { runtimeState, notes });
        }

        setIsDelegate(state, context) {
            let delegates = state.delegates;
            let manager = state.runtime_state?.cab_meeting?.record?.manager.value;
            const delegateMatch = delegates.find(del => del.sys_id.value === context.session.user.sys_id);
            return (delegateMatch) ? {
                ...state,
                'isDelegate': true
            } : {
                ...state,
                'isDelegate': manager === context.session.user.sys_id
            };
        }

        setNextAgendaItemId(state) {
            let agendaItems = state.agenda.agenda;
            if (agendaItems) {
                const pendingAgendaItems = agendaItems.filter(
                    ({
                        state: {
                            value
                        }
                    }) => value === 'pending'
                );

                const nextAgendaItemId = pendingAgendaItems.length > 0 ? pendingAgendaItems[0].sys_id.value : '';
                return {
                    ...state,
                    nextAgendaItemId
                };
            }
        }

        updateMeetingEmptyState(state, context, helpers) {
            const CABDataTransformer = imports['sn_mtg_cab.CABDataTransformer']();
            const cabDataTransformer = new CABDataTransformer();
            return cabDataTransformer.updateMeetingEmptyState(state, context, helpers);
        }

        _mergeToFetch(original, newSysId) {
            return `${original ? original + ',' : ''}${newSysId}`;
        }
    }
    return CABRecordWatcherHandlerSNC;
}
