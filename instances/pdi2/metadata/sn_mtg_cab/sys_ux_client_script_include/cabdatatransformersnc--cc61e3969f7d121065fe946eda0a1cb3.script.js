/**
 * 
 * @param {any} params.imports
 * @returns {CABDataTransformerSNC}
 */
function include({
    imports
}) {
    class CABDataTransformerSNC {
        /**
         * @returns {Array}
         */
        attendeeHydration(data) {
            if (!Array.isArray(data))
                return [];

            const result = data.map((attendee) => {
                const {
                    attendance,
                    avatar,
                    is_host: {
                        value: isHost
                    },
                    __profile: {
                        email,
                        name,
                        userID
                    }
                } = attendee;
                return {
                    attendanceStatus: attendance,
                    attendanceStatusTooltip: '',
                    hostLabel: 'CAB Manager',
                    showAttendance: true,
                    showEmail: true,
                    showHost: isHost,
                    userEmail: email,
                    userName: name,
                    headingLevel: 3,
                    avatar,
                    userSysId: userID
                };
            });
            return result;
        }

        /**
         * @returns {Array}
         */
        delegatesHydration(data) {
            const result = data.map((delegate) => {
                const {
                    email,
                    avatar,
                    name,
                    isHost,
                    sys_id
                } = delegate;
                return {
                    showAttendance: false,
                    showEmail: false,
                    showHost: isHost,
                    userEmail: email.display_value,
                    userName: name.display_value,
                    headingLevel: 4,
                    userSysId: sys_id.value,
                    email,
                    avatar,
                    name,
                    sys_id
                };
            });
            return result;
        }

        /**
         * @returns {JSON Object}
         */
        managerHydration(manager) {
            const {
                email,
                avatar,
                name,
                isHost,
                sys_id
            } = manager;

            return {
                showAttendance: false,
                showEmail: true,
                showHost: isHost,
                userEmail: email.display_value,
                userName: name.display_value,
                headingLevel: 4,
                userSysId: sys_id.value,
                email,
                avatar,
                name,
                sys_id
            };
        }

        /**
         * @returns {JSON Object}
         */
        meetingTimerHydration(meeting, headerLabels, isWatcher) {
            const {
                actual_start,
                start,
                end,
                state
            } = meeting;

            const currentStateValue = state.value;
            let label = '';
            let timerState = 'stopped';

            headerLabels.forEach(function(labelValue) {
                if (labelValue.id === currentStateValue) {
                    label = labelValue.label;
                    if (currentStateValue === 'in_progress')
                        timerState = 'active';
                }
            });

            if (isWatcher) {
                const CabAgendaPatching = imports['sn_mtg_cab.CABAgendaPatching']();
                const cabAgendaPatching = new CabAgendaPatching();

                start.value_ms = cabAgendaPatching.__durationToMs(start.value);
                actual_start.value_ms = cabAgendaPatching.__durationToMs(actual_start.value);
                end.value_ms = cabAgendaPatching.__durationToMs(end.value);
            }

            const totalDuration = end.value_ms - start.value_ms;
            const actualStart = actual_start.value_ms || start.value_ms;
            const endTime = actualStart + totalDuration;
            const startTime = timerState === 'active' ?
                new Date().getTime() :
                actualStart;

            return {
                totalDuration,
                duration: endTime - startTime,
                label,
                timerState
            };
        }

        /**
         * @returns {JSON Object}
         */
        notesHydration(data, userSysId) {
            const isCABManager = function(userSysId, manager, host) {
                if (!userSysId)
                    return false;

                if (host && host?.value === userSysId)
                    return true;

                if (manager && manager?.sys_id?.value === userSysId)
                    return true;

                return false;
            };

            const isCABManagerDelegate = function(userSysId, delegates) {
                if (!userSysId || !delegates || !Array.isArray(delegates))
                    return false;

                const isDelegate = delegates.filter((delegate) => {
                    const {
                        sys_id
                    } = delegate;
                    return sys_id?.value === userSysId;
                }).length > 0;

                return isDelegate;
            };

            const {
                manager,
                runtime_state: {
                    host,
                    notes_editor,
                    cab_meeting
                },
                delegates
            } = data;

            const hasWriteAccess = isCABManager(userSysId, manager, host) || isCABManagerDelegate(userSysId, delegates);
            const isEditor = notes_editor?.value === userSysId;
            const meetingNotes = cab_meeting?.record?.meeting_notes?.value;
            const meetingName = cab_meeting?.display_value;

            return {
                hasWriteAccess,
                isEditor,
                meetingNotes,
                meetingName
            };
        }

        /**
         * @returns boolean
         */
        getIsHost(data, context) {
            let host = data.runtime_state.host.value;
            if (!host)
                host = data.runtime_state.cab_meeting.record.manager.value;
            return context.session.user.sys_id === host;
        }

        getIsDelegate(data, context) {
            let delegates = data.delegates;
            let manager = data.runtime_state.cab_meeting.record.manager.value;
            const delegateMatch = delegates.find(del => del.sys_id.value === context.session.user.sys_id);
            return delegateMatch ? true : manager === context.session.user.sys_id;
        }

        /**
         * @returns string (sys_id)
         */
        getNextAgendaItemId(data) {
            let agendaItems = data.agenda.agenda || [];
            const pendingAgendaItems = agendaItems.filter(({
                state: {
                    value
                }
            }) => value === 'pending');
            return pendingAgendaItems.length > 0 ? pendingAgendaItems[0].sys_id.value : '';
        }

        /**
         * @returns {JSON Object}
         */
        getCurrentAgendaItem(state, data) {
            if (!state.runtimeState.current_agenda_item.value)
                return;
            const CabAgendaPatching = imports['sn_mtg_cab.CABAgendaPatching']();
            const cabAgendaPatching = new CabAgendaPatching();

            const inProgressStates = ['in_progress', 'paused'];
            let currentAgendaItem = state.agenda.agenda.filter(({
                state: {
                    value
                }
            }) => inProgressStates.includes(value))[0];
            const requestTime = data.runtime_state.request_time_ms;
            let currentAgendaStart = state.runtimeState.current_agenda_item_start.value;
            currentAgendaItem = cabAgendaPatching.hydrateAgendaTimer(currentAgendaItem, currentAgendaStart, requestTime);
            return currentAgendaItem;
        }

        /**
         * @returns {JSON Object} representing the record selected
         */
        getSelectedAgendaItem(state, data) {
            if (state.currentAgendaItem && Object.keys(state.currentAgendaItem).length > 0)
                return state.currentAgendaItem;
            else if (state.agenda?.currentPageData && state.agenda.currentPageData.length > 0)
                return state.agenda.currentPageData[0];
            return null;
        }

        requestMoreAgendaItems(state, event) {
            const CABAgendaPatching = imports['sn_mtg_cab.CABAgendaPatching']();
            const cabAgendaPatching = new CABAgendaPatching(state.agendaListTabs.paginationRecordsPerPage);

            state.agenda.agenda = cabAgendaPatching.addFirstPendingAgenda(state.agenda.agenda);
            let agendaState = state.agenda;
            
            let agendaListTabs = state.agendaListTabs;
            let selectedTab = agendaListTabs.selectedTab;
            
            let filterId = agendaListTabs.filterId;
            let filter = agendaListTabs.filter || cabAgendaPatching.getFilter(agendaListTabs.filters, selectedTab, filterId);
            state.agendaListTabs.filter = filter;

            let agendaPageNum = 1;
            if (event) {
                filterId = event.payload.filterId || filterId;
                selectedTab = event.payload.tabId || selectedTab;
                agendaPageNum = event.payload.pageNum + 1 || agendaPageNum;
                filter = cabAgendaPatching.getFilter(agendaListTabs.filters, selectedTab, filterId);

                state.agendaListTabs.selectedTab = selectedTab;
                state.agendaListTabs.filterId = filterId;
                state.agendaListTabs.filter = filter;
                state.agendaPageNum = agendaPageNum;
            }
            const toFetch = cabAgendaPatching.getAgendaIdsToFetch(agendaState.agenda, agendaState.nriState, filter, agendaPageNum);
            if (toFetch)
                state = Object.assign(state, {
                    agendaItemsToFetch: toFetch
                });
            else {
                agendaState.agenda = cabAgendaPatching.hydrateTimers(agendaState.agenda);
                const {
                    totalCount,
                    currentPage
                } = cabAgendaPatching.getCurrentPageAndCount(agendaState.agenda, agendaState.nriState, filter, agendaPageNum);

                state.agenda = agendaState;
                state.agenda.totalFilteredAgenda = totalCount;
                state.agenda.currentPageData = currentPage;
                state.showAgendaLoader = false;
            }
            return state;
        }

        async updateMeetingEmptyState(state, context, helpers) {
            const runtimeState = state.runtimeState;
            const emptyStates = state.emptyStates;
            const {
                agenda,
                nriState
            } = state.agenda;
            const states = ['pending', 'in_progress', 'paused'];
            const pendingAgenda = [...agenda, ...nriState].filter(
                agendaItem => states.includes(agendaItem.state) || states.includes(agendaItem.state?.value)
            );
            const meetingState = runtimeState.cab_meeting.record.state.value;
            const completedDateTime = this._getCompletedMeetingDateTime(runtimeState, context);
            let message = '';
            switch (meetingState) {
                case 'pending':
                case 'in_progress':
                    runtimeState.emptyState = (pendingAgenda.length === 0) ? emptyStates[meetingState] : null;
                    break;
                case 'canceled':
                    runtimeState.emptyState = emptyStates[meetingState];
                    break;
                case 'complete':
                    runtimeState.emptyState = emptyStates[meetingState];
                    runtimeState.emptyState.content = await helpers.translate(emptyStates[meetingState].content, [completedDateTime.dateValue, completedDateTime.timeValue]);
                    break;
                default:
                    runtimeState.emptyState = null;
            }
            return {
                ...state,
                runtimeState
            };
        }

        _getCompletedMeetingDateTime(runtimeState, context) {
            const actualEndDate = runtimeState.cab_meeting?.record?.actual_end?.value;
            if (!actualEndDate)
                return;
            const cabUtils = imports['sn_mtg_cab.CABUtils']();
            const sowDateTimeHelper = imports['sn_sow.SOWDateTimeHelper']();

            const utils = new cabUtils();
            const dateTimeFormat = context.session.user.dateTimeFormat;
            const tz = runtimeState.cab_meeting.record.actual_end.tz_name;
            const dt = sowDateTimeHelper.getNowDateTime(actualEndDate, dateTimeFormat, tz);

            const dateValue = dt.format(utils.parseDateTimeFormat(context.session.user.dateFormat));
            const timeValue = dt.format(context.session.user.timeFormat);
            return {
                dateValue,
                timeValue
            };
        }
    }

    return CABDataTransformerSNC;
}
