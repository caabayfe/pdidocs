var WorkspaceCABMeetingSNC = Class.create();

WorkspaceCABMeetingSNC.prototype = {
    initialize: function(cabMeetingSysId) {
        this._gr = this._fetchMeetingGr(cabMeetingSysId);
        this._sysId = this.isValidCABMeeting() ? cabMeetingSysId : null;
        this.setPageSize();
        this.totalAttendees = 0;
        this.setCabMeeting(this.isValidCABMeeting() ? new sn_change_cab.CABMeetingSNC(this._gr) : null);
        this.setRuntimeState(this.isValidCABMeeting() ? sn_change_cab.CABRuntimeStateSNC.get(this._sysId) : null);
        this.workspaceId = '';
    },

    isValidCABMeeting: function() {
        return this._gr ? true : false;
    },

    setCabMeeting: function(cabMeeting) {
        this.cabMeeting = cabMeeting;
    },

    setWorkspaceId: function(workspaceId) {
        this.workspaceId = workspaceId;
    },

    setRuntimeState: function(runtimeState) {
        this.runtimeState = runtimeState;
    },

    getInitialData: function() {
        if (!this.runtimeState)
            return false;

        var agendaState = this._getAgenda();

        var rs = this.runtimeState.toJS();
        rs.cab_meeting.record = this.cabMeeting.toJS();

        var attendeeData = this._getAttendees(rs);
        var attendeesControlData = this._getAttendeesControl();
        var managerData = this._getManager();
        var delegatesData = this._getDelegates();

        var agendaListTabs = this._getAgendaListTabs(rs.cab_meeting.record.state.value);

        rs.request_time_ms = (new GlideDateTime()).getNumericValue();
        rs.cab_meeting.record.actual_start.value_ms = new GlideDateTime(rs.cab_meeting.record.actual_start.value).getNumericValue();
        rs.cab_meeting.record.start.value_ms = new GlideDateTime(rs.cab_meeting.record.start.value).getNumericValue();
        rs.cab_meeting.record.end.value_ms = new GlideDateTime(rs.cab_meeting.record.end.value).getNumericValue();

        return {
            runtime_state: rs,
            agenda: agendaState,
            attendeesData: attendeeData,
            attendeesControl: attendeesControlData,
            agendaListTabs: agendaListTabs,
            delegates: delegatesData,
            manager: managerData,
            isHost: false,
            headerLabels: this._getHeaderLabels(),
            activityStreamData: this._activityStreamData(),
            emptyStateOptions: this._getStateInfoOptions()
        };
    },

    getAgendaItems: function(agendaItemIds) {
        var agendaItems = new sn_change_cab.CABMeeting().getAgendaItems(agendaItemIds);

        if (!agendaItems || agendaItems.length === 0)
            return null;
        return this._hydrateAgendaWithRelated(agendaItems);
    },

    getHost: function() {
        var rs = this.runtimeState.toJS();
        rs.cab_meeting.record = this.cabMeeting.toJS();
        var host = '';
        if (this.runtimeState.getHost() || (rs.cab_meeting && rs.cab_meeting.record && rs.cab_meeting.record.manager))
            host = rs.host.value || rs.cab_meeting.record.manager.value;
        return host;
    },

    setPageSize: function(size) {
        this.pageSize = !size ? 5 : size;
    },

    deferAgendaItem: function(nextItemId, noDecision) {
        this.runtimeState._closeCurrentAgendaItem(noDecision);
        this.runtimeState._replaceCurrentAgendaItem(nextItemId, noDecision);
    },

    restoreAgendaItem: function(agendaItemId) {
        var agendaItemGr = new GlideRecord(sn_change_cab.CAB.AGENDA_ITEM);
        if (!agendaItemGr.get(agendaItemId))
            return;

        var decision = agendaItemGr.getValue('state');
        if (decision !== 'no_decision')
            return;

        var agendaItem = new sn_change_cab.CABAgendaItem(agendaItemGr);
        var agendaState = '';
        if (this.runtimeState.hasCurrentAgendaItem()) {
            var order = this.cabMeeting.getLastPendingAgendaItemOrder() + 100;
            agendaItem.setValue('state', sn_change_cab.CAB.MEETING_STATE.PENDING);
            agendaItem.setValue('order', order);
            agendaState = sn_change_cab.CAB.MEETING_STATE.PENDING;
        } else {
            agendaItem.setValue('state', sn_change_cab.CAB.MEETING_STATE.IN_PROGRESS);
            this.runtimeState.setCurrentAgendaItem(agendaItemId);
            this.runtimeState.update();
            agendaState = sn_change_cab.CAB.MEETING_STATE.IN_PROGRESS;
        }
        agendaItem.update();
        return agendaState;
    },

    _fetchMeetingGr: function(meetingSysId) {
        var cabMeetingGr = new GlideRecord(sn_change_cab.CAB.MEETING);
        if (cabMeetingGr.get(meetingSysId))
            return cabMeetingGr;
        return null;
    },

    _getAgenda: function() {
        var agendaState = this.cabMeeting.getInitialAgendaState();
        agendaState.agenda = this._hydrateAgendaWithRelated(agendaState.agenda);
        agendaState.agenda = this._hydrateAgendaWithHighlightedValue(agendaState.agenda);

        return agendaState;
    },

    _hydrateAgendaWithRelated: function(agenda) {
        for (var i = 0; i < agenda.length; i++) {
            var agendaItem = agenda[i];
            var taskSysId = agendaItem.task.value;

            var relatedRecordCounts = this.getRelatedRecordCounts(taskSysId);
            agendaItem.task.relatedRecords = relatedRecordCounts;
        }

        return agenda;
    },

    _hydrateAgendaWithHighlightedValue: function(agenda) {
        for (var i = 0; i < agenda.length; i++) {
            var agendaItem = agenda[i];
            if (!agendaItem.task.record)
                continue;
            var taskSysId = agendaItem.task.value;
            var taskTable = agendaItem.task.record.sys_class_name.value;

            if (this.workspaceId) {
                var taskGr = new GlideRecord(taskTable);
                if (taskGr.get(taskSysId)) {
                    var highlightedValueUtils = new global.ITSMHighlightedValueUtils(taskGr);
                    var highlightedValue = highlightedValueUtils.getHighlightedAttributes(this.workspaceId);

                    if (!highlightedValue)
                        continue;
                    for (var key in highlightedValue[taskTable])
                        if (agendaItem.task.record[key])
                            agendaItem.task.record[key].highlightedValueConfig = highlightedValue[taskTable][key];
                }
            }
        }
        return agenda;
    },

    getRelatedRecordCounts: function(taskSysId) {
        var relatedRecordCount = {};

        // Get number of Affected CIs associated to a task
        var taskCiGa = new GlideAggregate('task_ci');
        taskCiGa.addQuery('task', taskSysId);
        taskCiGa.addAggregate('COUNT');
        taskCiGa.groupBy('task');
        taskCiGa.query();
        if (taskCiGa.next())
            relatedRecordCount.affectedCiCount = taskCiGa.getAggregate('COUNT');
        else
            relatedRecordCount.affectedCiCount = 0;

        // Get number of Approvals in Requested state associated to a task
        var approvalGa = new GlideAggregate('sysapproval_approver');
        approvalGa.addQuery('sysapproval', taskSysId);
        approvalGa.addQuery('state', 'requested');
        approvalGa.addAggregate('COUNT');
        approvalGa.groupBy('sysapproval');
        approvalGa.query();
        if (approvalGa.next())
            relatedRecordCount.requestedApprovalsCount = approvalGa.getAggregate('COUNT');
        else
            relatedRecordCount.requestedApprovalsCount = 0;

        return relatedRecordCount;
    },

    _getAgendaListTabs: function(meetingState) {
        var agendaListTabs = {
            selectedTab: meetingState === 'complete' ? 'id=all' : 'id=up_next',
            paginationRecordsPerPage: 5,
            filters: {
                all: {},
                completed: {
                    state: 'complete'
                },
                deferred: {
                    state: 'no_decision'
                },
                myItems: {
                    assigned_to: gs.getUserID()
                },
                upNext: {
                    state: 'pending'
                }
            }
        };
        agendaListTabs.tabs = [{
                id: 'allAgendaItems',
                label: gs.getMessage('All agenda items')
            },
            {
                id: 'myAgendaItems',
                label: gs.getMessage('My agenda items')
            },
            {
                id: 'completed',
                label: gs.getMessage('Completed')
            }
        ];
        return agendaListTabs;
    },

    getTotalAttendees: function() {
        return this.totalAttendees;
    },

    _paginateData: function(array, currentPage) {
        var startIndex = (currentPage - 1) * this.pageSize;
        var endIndex = startIndex + this.pageSize;
        return array.slice(startIndex, endIndex);
    },

    searchAttendees: function(freetext, currentPage, sort, filter) {
        return {
            attendeesData: this._searchAttendees(freetext, currentPage, sort, filter)
        };
    },

    _searchAttendees: function(freetext, currentPage, sort, filter) {
        var attendeeData = this.cabMeeting.searchAttendees(freetext);

        if (sort && sort.indexOf('desc') > -1)
            attendeeData.reverse();

        var host = this.getHost();
        attendeeData.forEach(function(attendee) {
            attendee.userSysId = attendee.sys_id.value;
            var isHost = host === attendee.sys_id.value;
            attendee.is_host = {
                value: isHost,
                display_value: isHost ? gs.getMessage('CAB host') : ''
            };
            attendee.avatar = {
                size: 'md',
                icon: '',
                interaction: '',
                aria: {},
                tooltip: gs.getMessage('User is CAB attendee'),
                hideTooltip: false,
            };
        });
        if (filter && filter !== 'all') {
            var filteredAttendeeData = attendeeData.filter(function(attendee) {
                return attendee.attendance.value === filter;
            });
            attendeeData = filteredAttendeeData;
        }
        this.totalAttendees = attendeeData.length;
        attendeeData = this._paginateData(attendeeData, currentPage);
        return {
            attendees: attendeeData,
            pagination: {
                total: this.totalAttendees,
                pageSize: this.pageSize,
                pages: Math.ceil(this.totalAttendees / this.pageSize)
            }
        };
    },

    _getAttendees: function(runtimeState, currentPage, orderBy, filterByStatus) {
        currentPage = !currentPage ? 1 : currentPage;
        orderBy = !orderBy ? 'asc' : orderBy;
        filterByStatus = !filterByStatus ? 'all' : filterByStatus;

        return this._searchAttendees('__firstInit', currentPage, orderBy, filterByStatus);
    },

    _getAttendeesControl: function() {
        var filter = this._getAttendeesFilterOptions();
        var filterAriaLabel = this._getAriaLabel(filter);
        var sort = this._getAttendeesSortOptions();
        var attendeesControl = {
            filter: filter,
            filterAriaLabel: filterAriaLabel,
            sort: sort,
            sortAriaLabel: {
                'trigger': {
                    'aria-label': gs.getMessage('Sort attendees')
                }
            },
            pagination: {
                total: this.totalAttendees,
                pageSize: this.pageSize,
                pages: Math.ceil(this.totalAttendees / this.pageSize)
            }
        };
        return attendeesControl;
    },

    _getAttendeesFilterOptions: function() {
        var attendances = [{
            'id': 'all',
            'label': gs.getMessage('All')
        }];
        var gr = new GlideRecord('sys_choice');
        gr.addQuery('name', 'mtg_attendee');
        gr.addQuery('element', 'attendance');
        gr.addQuery('language', gs.getSession().getLanguage());
        gr.query();
        while (gr.next()) {
            attendances.push({
                'id': gr.getValue('value'),
                'label': gr.getValue('label')
            });
        }
        return attendances;
    },

    _getAriaLabel: function(list) {
        var optionsList = [];
        for (var i = 0; i < list.length; i++)
            optionsList.push(list[i].label);
        return {
            'trigger': {
                'aria-label': gs.getMessage('Show {0}', optionsList.join(' '))
            }
        };
    },

    _getAttendeesSortOptions: function() {
        return [{
                'id': 'userName_asc',
                'field': 'userName',
                'order': 'asc',
                'label': gs.getMessage('Alphabetical (A-Z)')
            },
            {
                'id': 'userName_desc',
                'field': 'userName',
                'order': 'desc',
                'label': gs.getMessage('Alphabetical (Z-A)')
            }
        ];
    },

    _getDelegates: function() {
        var delegates = [];
        if (!this._gr.getValue('delegates'))
            return delegates;

        var cab = new sn_change_cab.CAB();
        var delegateGr = new GlideRecordSecure('sys_user');
        delegateGr.addQuery('sys_id', 'IN', this._gr.getValue('delegates'));
        delegateGr.query();

        var host = this.getHost();
        while (delegateGr.next()) {
            var delegate = cab._toJS(delegateGr, false);
            delegate.isHost = host === delegate.sys_id.value;
            delegate.avatar = {
                size: 'sm',
                icon: '',
                interaction: '',
                aria: {},
                tooltip: gs.getMessage('User is CAB delegate'),
                hideTooltip: false,
            };
            delegates.push(delegate);
        }
        return delegates;
    },

    _getManager: function() {
        var manager = {};
        if (!this._gr.getValue('manager'))
            return {};

        var cab = new sn_change_cab.CAB();
        var managerGr = new GlideRecordSecure('sys_user');
        if (managerGr.get(this._gr.getValue('manager')))
            manager = cab._toJS(managerGr, false);

        manager.isHost = this.getHost() === manager.sys_id.value;
        manager.avatar = {
            size: 'md',
            icon: '',
            interaction: '',
            aria: {},
            tooltip: gs.getMessage('User is CAB manager'),
            hideTooltip: false,
        };
        return manager;
    },

    _getHeaderLabels: function() {
        return [{
                'id': 'pending',
                'label': gs.getMessage('Scheduled time')
            },
            {
                'id': 'in_progress',
                'label': gs.getMessage('Running')
            },
            {
                'id': 'canceled',
                'label': gs.getMessage('Meeting canceled')
            },
            {
                'id': 'complete',
                'label': gs.getMessage('Meeting ended')
            },
        ];
    },

    _activityStreamData: function() {
        var activityStreamData = {
            hideActivityStream: gs.getProperty('sn_mtg_cab.com.snc.change_management.cab.hideActivityStream', false),
            journalFields: {}
        };

        var gr = new GlideRecord('change_request');
        var elements = gr.getElements();
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var descriptor = element.getED();
            var type = descriptor.getInternalType();

            if (descriptor.getInternalType() !== 'journal_input')
                continue;

            var name = element.getName();
            var label = element.getLabel();
            var canWrite = element.canWrite();
            var canRead = element.canRead();

            activityStreamData.journalFields[name] = this._getJournalField(name, label, type, canWrite, canRead, 8000);
        }

        return activityStreamData;
    },

    _getJournalField: function(name, label, type, canWrite, canRead, maxLength) {
        return {
            name: name,
            label: label,
            type: type,
            maxLength: maxLength,
            readonly: !canWrite,
            sys_readonly: !canWrite,
            visible: canRead
        };
    },

    _getStateInfoOptions: function() {
        var emptyStateOptions = {};
        var upcomingMeetingsList = [{
            'label': gs.getMessage('Go to upcoming CAB meetings'),
            'icon': '',
            'variant': 'primary',
            'tooltipContent': gs.getMessage('Open a list with all CAB meetings')
        }];
        var meetingRecord = [{
            'label': gs.getMessage('Go to CAB meeting'),
            'icon': '',
            'variant': 'primary',
            'tooltipContent': gs.getMessage('Open the current CAB meeting')
        }];

        // Add options for 'complete' state
        emptyStateOptions.complete = {
            name: 'complete',
            heading: {
                label: gs.getMessage('The CAB meeting was completed')
            },
            content: gs.getMessage('The meeting was completed on {0} at {1}', ['{0}', '{1}']),
            illustration: 'completed-tasks',
            action: this._gr.canRead() ? upcomingMeetingsList : null
        };

        // Add options for 'canceled' state
        emptyStateOptions.canceled = {
            name: 'canceled',
            heading: {
                label: gs.getMessage('The CAB meeting was canceled')
            },
            content: '',
            illustration: 'interrupted',
            action: this._gr.canRead() ? upcomingMeetingsList : null
        };

        // Add options for 'pending' state
        emptyStateOptions.pending = {
            name: 'no_agendas',
            heading: {
                label: gs.getMessage('No agenda defined')
            },
            content: '',
            illustration: 'add-attachment',
            action: this._gr.canRead() ? meetingRecord : null
        };

        // Add options for 'in_progress' state
        emptyStateOptions.in_progress = {
            name: 'all_done',
            heading: {
                label: gs.getMessage('Well done!')
            },
            content: gs.getMessage('All agenda items were reviewed'),
            illustration: 'completed-tasks',
            action: this._gr.canRead() ? upcomingMeetingsList : null
        };

        return emptyStateOptions;
    },

    shareMeetingNotes: function() {
        if (!this._sysId)
            return {
                errorMsg: gs.getMessage('CAB Meeting SysId not provided')
            };

        if (this.runtimeState.getHost() === gs.getUserID() || this.runtimeState.getNotesEditor() === gs.getUserID()) {
            this.cabMeeting.shareMeetingNotes();
            return {
                msg: gs.getMessage('Successfully shared notes to Attendees')
            };
        } else
            return {
                errorMsg: gs.getMessage('Failed to share CAB Meeting notes with Attendees')
            };
    },

    /**
     * sendInvites: boolean. Should create notification events for all CAB attendees
     * 
     * returns: JSON object. { 'status': string, 'messages': string[] }.
     */
    refreshAgendaItems: function(sendInvites, fields) {
        this._updateCABFromJSON(fields);

        var result = {
            status: 'not_sent',
            messages: []
        };
        this.cabMeeting.refreshChangeAgendaItems();
        var extendTimings = this.cabMeeting.checkForExtendTimings();
        if (extendTimings && extendTimings.adjustmentNeeded) {
            var adjustmentEndTime = extendTimings.adjustmentEndTime.getDisplayValue();
            var adjustmentTimePerAgendaItem = extendTimings.adjustmentTimePerAgendaItem.getDisplayValue();
            var message = gs.getMessage('Based on your current time per agenda item of {0} and the meeting duration, you will not have enough time to complete all the agenda items. You will either need to reduce the time per item to {1} or extend the meeting end time to {2}', [this._gr.time_per_agenda_item.getDisplayValue(), adjustmentTimePerAgendaItem, adjustmentEndTime]);
            result.messages.push(message);
        }
        if (sendInvites) {
            var now = new GlideDateTime();
            var notificationMessage = this.createNotificationEvents('updated');
            result.status = 'sent';
            if (notificationMessage)
                result.messages.push(notificationMessage);
        }
        return result;
    },

    _updateCABFromJSON: function(fields) {
        if (!fields || Object.keys(fields).length === 0)
            return;

        var fieldNames = Object.keys(fields);
        var recordUpdated = false;
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            var field = fields[fieldName];
            var newValue = field.value;

            if (this._gr.getValue(fieldName) !== newValue && field.canWrite) {
                this._gr.setValue(fieldName, newValue);
                recordUpdated = true;
            }
        }

        if (recordUpdated)
            this._gr.update();
    },

    /**
     * Creates events for attedees
     * 
     * Params:
     * sendOption: String. 'all', 'updated' or 'new' are the valid options
     * 
     * returns: String. Message explaining the outcome
     */
    createNotificationEvents: function(sendOption) {
        var message;
        var hasSentNotifications = false;
        var updatedAfter;

        switch (sendOption) {
            case 'all':
            case 'updated':
                if (sendOption === 'updated')
                    updatedAfter = new GlideDateTime();
                hasSentNotifications = this.cabMeeting.createCABAttendeeNotifyEvents(updatedAfter) > 0;
                message = hasSentNotifications ? gs.getMessage('Notifications sent to new or updated attendees') : gs.getMessage('No notifications sent since there is no new or updated attendee');
                break;
            case 'new':
                hasSentNotifications = this.cabMeeting.createCABAttendeeNotifyEventsForNewAttendees() > 0;
                message = hasSentNotifications ? gs.getMessage('Notifications sent to new attendees') : gs.getMessage('No notifications sent as all attendees have already received the meeting request');
                break;
            default:
                message = gs.getMessage('Option provided is not valid');
        }

        return message;
    },

    type: 'WorkspaceCABMeetingSNC'
};
