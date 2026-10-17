var PIRManagerSNC = Class.create();
PIRManagerSNC.prototype = {
    LOG_PROPERTY: 'com.snc.incident.log.level',

    initialize: function() {
        this._log = new global.GSLog(this.LOG_PROPERTY, this.type);
        this._log.includeTimestamp();
        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug('[initialize] type: ' + this.type);
        this.constants = new PostIncidentReportConstants();
        this.pirUtil = new PostIncidentReportUtil();
        this.pirSummary = new PostMajorIncidentSummary();
    },
    syncIncidentSummary: function(incidentSysID) {
        this.pirSummary.syncIncidentSummary(incidentSysID);
    },
    updateTimelineSettings: function(incidentSysId, settings) {
        var status = 200;
        var result = {};
        try {
            var timelineEvents = this.retrieveTimelineData(incidentSysId).events;
            var gr = this.pirUtil.getPirByIncidentSysId(incidentSysId);
            if (gr.next()) {
                gr.setValue(this.constants.POST_INCIDENT_REVIEW.TIMELINE_SETTINGS, JSON.stringify(settings));
                gr.update();
            }
            result = {
                actionType: this.constants.ACTION_TYPE.UPDATE_TIMELINE_SETTINGS,
                message: gs.getMessage("Timeline settings updated successfully.")
            };
        } catch (error) {
            result = {
                message: error.message
            };
            status = 404;
        }
        return {
            actionType: result.actionType,
            message: result.message,
            status: status
        };
    },
    insertOrUpdateEvent: function(incidentSysId, event) {
        var status = 200;
        var result = {};
        try {
            var timelineEvents = this.retrieveTimelineData(incidentSysId).events;
            var eventIndex = -1;
            for (i = 0; i < timelineEvents.length; i++) {
                if (timelineEvents[i].id && timelineEvents[i].id == event.id) {
                    eventIndex = i;
                }
            }
            if (eventIndex != -1) {
                timelineEvents[eventIndex] = event;
                var gr = this.pirUtil.getPirByIncidentSysId(incidentSysId);
                if (gr.next()) {
                    gr.setValue(this.constants.POST_INCIDENT_REVIEW.TIMELINE_EVENTS, JSON.stringify({
                        "events": timelineEvents
                    }));
                    gr.update();
                }
                result = {
                    actionType: this.constants.ACTION_TYPE.UPDATE_TIMELINE_EVENTS,
                    message: gs.getMessage("Timeline updated.")
                };
            } else {
                if (!event.timestamp || !event.message) {
                    status = 404;
                    result = {
                        actionType: this.constants.ACTION_TYPE.CREATE_TIMELINE_EVENT,
                        message: gs.getMessage("Failed to add event to the timeline.")
                    };
                } else {
                    this._createCustomEvent(incidentSysId, timelineEvents, event);
                    result = {
                        actionType: this.constants.ACTION_TYPE.CREATE_TIMELINE_EVENT,
                        message: gs.getMessage("Event added to the timeline.")
                    };
                }
            }
        } catch (error) {
            result = {
                message: error.message
            };
            status = 404;
        }
        return {
            message: result.message,
            status: status
        };
    },
    _createCustomEvent: function(incidentSysId, timelineEvents, event) {
        var id = GlideSecureRandomUtil.getSecureRandomString(6);
        event = {
            id: id,
            timestamp: event.timestamp,
            message: event.message,
            eventType: this.constants.CUSTOM_EVENT,
            generatedBy: this.constants.GENERATED_BY.USER
        };
        timelineEvents.push(event);
        var gr = this.pirUtil.getPirByIncidentSysId(incidentSysId);
        if (gr.next()) {
            gr.setValue('timeline_events', JSON.stringify({
                "events": timelineEvents
            }));
            gr.update();
        }
    },
    _getEvent: function(timelineEvents, eventSysId, eventType) {
        var event = null;
        for (i = 0; i < timelineEvents.length; i++) {
            if (timelineEvents[i].eventType == eventType && !gs.nil(timelineEvents[i].category) && (timelineEvents[i].category.source == "INCIDENT" || timelineEvents[i].category.sysId == eventSysId)) {
                event = timelineEvents[i];
                break;
            }
        }
        return event;
    },
    updateSystemGeneratedEvent: function(incidentSysId) {
        this.createTimeLineEvents(incidentSysId, true);
    },
    createTimeLineEvents: function(incidentSysId, shouldUpdateSystemEvents) {
        var events = [];
        var incidentGr = this.pirUtil.getIncidentRecord(incidentSysId);
        if (incidentGr.next()) {
            var incidentCreatedOn = incidentGr.getValue(this.constants.OPENED_AT);
            var incidentCreatedBy = incidentGr.getValue(this.constants.OPENED_BY);
            if (shouldUpdateSystemEvents) {
                var timelineEvents = this.retrieveTimelineData(incidentSysId).events;
            }
            var defaultTimelineAdminSettings = this.pirUtil.getDefaultAdminSettings();
            if (!gs.nil(incidentCreatedOn)) {
                var event = {
                    id: GlideSecureRandomUtil.getSecureRandomString(6),
                    timestamp: incidentCreatedOn,
                    message: gs.getMessage("Incident created by {0}", [(incidentCreatedBy ? incidentCreatedBy : "-")]),
                    eventType: this.constants.INCIDENT.INCIDENT_CREATED._KEY,
                    generatedBy: this.constants.GENERATED_BY.SYSTEM,
                    associatedUser: incidentCreatedBy,
                    isHidden: defaultTimelineAdminSettings && defaultTimelineAdminSettings.eventSources && !defaultTimelineAdminSettings.eventSources.milestones ? true : false,
                    category: {
                        source: this.constants.EVENT_SOURCE.INCIDENT
                    }
                };
                if (shouldUpdateSystemEvents) {
                    var existingEvent = this._getEvent(timelineEvents, incidentSysId, this.constants.INCIDENT.INCIDENT_CREATED._KEY);
                    if (existingEvent) {
                        event.isHidden = existingEvent.isHidden;
                    }
                }
                events.push(event);
            }
            var incidentClosedOn = incidentGr.getValue(this.constants.CLOSED_AT);
            var incidentClosedBy = incidentGr.getValue(this.constants.CLOSED_BY);
            if (!gs.nil(incidentClosedOn)) {
                event = {
                    id: GlideSecureRandomUtil.getSecureRandomString(6),
                    timestamp: incidentClosedOn,
                    message: gs.getMessage("Incident closed by {0}", [(incidentClosedBy ? incidentClosedBy : "-")]),
                    eventType: this.constants.INCIDENT.INCIDENT_CLOSED._KEY,
                    generatedBy: this.constants.GENERATED_BY.SYSTEM,
                    associatedUser: incidentClosedBy,
                    category: {
                        source: this.constants.EVENT_SOURCE.INCIDENT
                    }
                };
                if (shouldUpdateSystemEvents) {
                    existingEvent = this._getEvent(timelineEvents, incidentSysId, this.constants.INCIDENT.INCIDENT_CLOSED._KEY);
                    if (existingEvent) {
                        event.isHidden = existingEvent.isHidden;
                    }
                }
                events.push(event);
            }
            var incidentResolvedOn = incidentGr.getValue(this.constants.INCIDENT.RESOLVED_AT);
            var incidentResolvedBy = incidentGr.getValue(this.constants.INCIDENT.RESOLVED_BY);
            if (!gs.nil(incidentResolvedOn)) {
                event = {
                    id: GlideSecureRandomUtil.getSecureRandomString(6),
                    timestamp: incidentResolvedOn,
                    message: gs.getMessage("Incident marked as Resolved by {0}", [(incidentResolvedBy ? incidentResolvedBy : "-")]),
                    eventType: this.constants.INCIDENT.INCIDENT_RESOLVED._KEY,
                    generatedBy: this.constants.GENERATED_BY.SYSTEM,
                    associatedUser: incidentResolvedBy,
                    isHidden: defaultTimelineAdminSettings && defaultTimelineAdminSettings.eventSources && !defaultTimelineAdminSettings.eventSources.milestones ? true : false,
                    category: {
                        source: this.constants.EVENT_SOURCE.INCIDENT
                    }
                };
                if (shouldUpdateSystemEvents) {
                    existingEvent = this._getEvent(timelineEvents, incidentSysId, this.constants.INCIDENT.INCIDENT_RESOLVED._KEY);
                    if (existingEvent) {
                        event.isHidden = existingEvent.isHidden;
                    }
                }
                events.push(event);
            }
            var incidentAcceptedAsMajorIncidentOn = incidentGr.getValue(this.constants.INCIDENT.PROMOTED_AT);
            var incidentAcceptedAsMajorIncidentBy = incidentGr.getValue(this.constants.INCIDENT.PROMOTED_BY);
            if (!gs.nil(incidentAcceptedAsMajorIncidentOn)) {
                event = {
                    id: GlideSecureRandomUtil.getSecureRandomString(6),
                    timestamp: incidentAcceptedAsMajorIncidentOn,
                    message: gs.getMessage("Incident accepted as Major Incident by {0}", [(incidentAcceptedAsMajorIncidentBy ? incidentAcceptedAsMajorIncidentBy : "-")]),
                    eventType: this.constants.INCIDENT.INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT._KEY,
                    generatedBy: this.constants.GENERATED_BY.SYSTEM,
                    associatedUser: incidentAcceptedAsMajorIncidentBy,
                    isHidden: defaultTimelineAdminSettings && defaultTimelineAdminSettings.eventSources && !defaultTimelineAdminSettings.eventSources.milestones ? true : false,
                    category: {
                        source: this.constants.EVENT_SOURCE.INCIDENT
                    }
                };
                if (shouldUpdateSystemEvents) {
                    existingEvent = this._getEvent(timelineEvents, incidentSysId, this.constants.INCIDENT.INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT._KEY);
                    if (existingEvent) {
                        event.isHidden = existingEvent.isHidden;
                    }
                }
                events.push(event);
            }
            var incidentProposedAsMajorIncidentOn = incidentGr.getValue(this.constants.INCIDENT.PROPOSED_AT);
            var incidentProposedAsMajorIncidentBy = incidentGr.getValue(this.constants.INCIDENT.PROPOSED_BY);

            if (!gs.nil(incidentProposedAsMajorIncidentOn)) {
                event = {
                    id: GlideSecureRandomUtil.getSecureRandomString(6),
                    timestamp: incidentProposedAsMajorIncidentOn,
                    message: gs.getMessage("Incident proposed as Major Incident by {0}", [(incidentProposedAsMajorIncidentBy ? incidentProposedAsMajorIncidentBy : "-")]),
                    eventType: this.constants.INCIDENT.INCIDENT_PROPOSED_AS_MAJOR_INCIDENT._KEY,
                    generatedBy: this.constants.GENERATED_BY.SYSTEM,
                    associatedUser: incidentProposedAsMajorIncidentBy,
                    category: {
                        source: this.constants.EVENT_SOURCE.INCIDENT
                    }
                };
                if (shouldUpdateSystemEvents) {
                    existingEvent = this._getEvent(timelineEvents, incidentSysId, this.constants.INCIDENT.INCIDENT_PROPOSED_AS_MAJOR_INCIDENT._KEY);
                    if (existingEvent) {
                        event.isHidden = existingEvent.isHidden;
                    }
                }
                events.push(event);
            }

            var activitySupplementalGr = new GlideRecord(this.constants.SYS_ACTIVITY_SUPPLEMENTAL.TABLE);
            activitySupplementalGr.addQuery(this.constants.SYS_ACTIVITY_SUPPLEMENTAL.DOCUMENT_ID, incidentSysId);
            activitySupplementalGr.query();
            while (activitySupplementalGr.next()) {
                this.insertOrUpdateTimelineEvent(activitySupplementalGr, incidentGr, true, events, shouldUpdateSystemEvents);
            }

            var incidentTasks = [];
            var gr = this._getIncidentTasksByIncidentSysId(incidentSysId);
            while (gr.next()) {
                var incidentTaskSysId = gr.getValue(this.constants.SYS_ID);
                var incidentTaskCreatedOn = gr.getValue(this.constants.OPENED_AT);
                var incidentTaskCreatedBy = gr.getValue(this.constants.OPENED_BY);
                var incidentTaskState = gr.getValue(this.constants.STATE);
                var incidentTaskClosedOn = gr.getValue(this.constants.CLOSED_AT);
                var incidentTaskClosedBy = gr.getValue(this.constants.CLOSED_BY);
                if (!gs.nil(incidentTaskCreatedOn)) {
                    event = {
                        id: GlideSecureRandomUtil.getSecureRandomString(6),
                        timestamp: incidentTaskCreatedOn,
                        message: gs.getMessage("{0}: Incident task created by {1}", [gr.number, (incidentTaskCreatedBy ? incidentTaskCreatedBy : "-")]),
                        eventType: this.constants.INCIDENT_TASK.INCIDENT_TASK_CREATED._KEY,
                        generatedBy: this.constants.GENERATED_BY.SYSTEM,
                        associatedUser: incidentTaskCreatedBy,
                        category: {
                            source: this.constants.EVENT_SOURCE.INCIDENT_TASK,
                            sysId: incidentTaskSysId,
                            number: gr.getValue('number')
                        }
                    };
                    if (shouldUpdateSystemEvents) {
                        existingEvent = this._getEvent(timelineEvents, incidentTaskSysId, this.constants.INCIDENT_TASK.INCIDENT_TASK_CREATED._KEY);
                        if (existingEvent) {
                            event.isHidden = existingEvent.isHidden;
                        }
                    }
                    events.push(event);
                }
                if ((incidentTaskState == 3 || incidentTaskState == 4 || incidentTaskState == 7) && !gs.nil(incidentTaskClosedOn)) {
                    event = {
                        id: GlideSecureRandomUtil.getSecureRandomString(6),
                        timestamp: incidentTaskClosedOn,
                        message: gs.getMessage("{0}: Incident task closed by {1}", [gr.number, (incidentTaskClosedBy ? incidentTaskClosedBy : "-")]),
                        eventType: this.constants.INCIDENT_TASK.INCIDENT_TASK_CLOSED._KEY,
                        generatedBy: this.constants.GENERATED_BY.SYSTEM,
                        associatedUser: incidentTaskClosedBy,
                        category: {
                            source: this.constants.EVENT_SOURCE.INCIDENT_TASK,
                            sysId: incidentTaskSysId,
                            number: gr.getValue('number')
                        }
                    };
                    if (shouldUpdateSystemEvents) {
                        existingEvent = this._getEvent(timelineEvents, incidentTaskSysId, this.constants.INCIDENT_TASK.INCIDENT_TASK_CLOSED._KEY);
                        if (existingEvent) {
                            event.isHidden = existingEvent.isHidden;
                        }
                    }
                    events.push(event);
                }
            }
            gr = this.pirUtil.getPirByIncidentSysId(incidentSysId);
            if (gr.next()) {
                if (shouldUpdateSystemEvents) {
                    var customEvents = this._getCustomEvents(JSON.parse(gr.getValue('timeline_events')).events);
                    events = events.concat(customEvents);
                }
                gr.setValue(this.constants.POST_INCIDENT_REVIEW.TIMELINE_EVENTS, JSON.stringify({
                    "events": events
                }));
                if (!shouldUpdateSystemEvents) {
                    var defaultSettings;
                    if (defaultTimelineAdminSettings) {
                        var eventGroupingInHours = 0,
                            eventGroupingInMinutes = 0,
                            eventGroupingInSeconds = 0;
                        if (!defaultTimelineAdminSettings.eventGrouping.enabled) {
                            eventGroupingInMinutes = 5;
                            eventGroupingInSeconds = 300;
                        } else if (defaultTimelineAdminSettings.eventGrouping.groupBy == "Hours") {
                            eventGroupingInHours = defaultTimelineAdminSettings.eventGrouping.groupByValue;
                            eventGroupingInSeconds = defaultTimelineAdminSettings.eventGrouping.eventGroupingInSeconds;
                        } else if (defaultTimelineAdminSettings.eventGrouping.groupBy == "Mins") {
                            eventGroupingInMinutes = defaultTimelineAdminSettings.eventGrouping.groupByValue;
                            eventGroupingInSeconds = defaultTimelineAdminSettings.eventGrouping.eventGroupingInSeconds;
                        }
                        defaultSettings = JSON.stringify({
                            "eventGrouping": {
                                "enabled": defaultTimelineAdminSettings.eventGrouping.enabled,
                                "eventGroupingInHours": eventGroupingInHours,
                                "eventGroupingInMinutes": eventGroupingInMinutes,
                                "eventGroupingInSeconds": eventGroupingInSeconds
                            },
                            "orderOfEvents": defaultTimelineAdminSettings.orderOfEvents,
                            "showHiddenEventsInEditView": true,
                            "showManuallyAddedEvents": true,
                            "showTimelineInFinalReport": true
                        });
                    } else {
                        defaultSettings = JSON.stringify(this.constants.DEFAULT_SETTINGS);
                    }
                    gr.setValue(this.constants.POST_INCIDENT_REVIEW.TIMELINE_SETTINGS, defaultSettings);
                }
                gr.update();
            }
        }
    },
    removeTimelineEventIfPresent: function(incidentSysId, id) {
        var timelineEvents = this.retrieveTimelineData(incidentSysId).events;
        var index = null;
        for (i = 0; i < timelineEvents.length; i++) {
            if (timelineEvents[i].eventType == this.constants.SYS_ACTIVITY_SUPPLEMENTAL.ACTIVITY_FLAGGED._KEY && !gs.nil(timelineEvents[i].category) && (timelineEvents[i].category.id == id)) {
                index = i;
                break;
            }
        }
        if (!gs.nil(index))
            timelineEvents.splice(index, 1);
        var pirGR = this.pirUtil.getPirByIncidentSysId(incidentSysId);
        if (pirGR.next()) {
            pirGR.setValue(this.constants.POST_INCIDENT_REVIEW.TIMELINE_EVENTS, JSON.stringify({
                "events": timelineEvents
            }));
            pirGR.update();
        }
    },
    insertOrUpdateTimelineEvent: function(activitySupplementalGr, incidentGr, isSystemGeneratedEvent, events, shouldUpdateSystemEvents) {
        if (!activitySupplementalGr || !activitySupplementalGr.isValidRecord()) {
            return;
        }
        var incidentSysId;
        if (!incidentGr || !incidentGr.isValidRecord()) {
            incidentSysId = activitySupplementalGr.getValue(this.constants.SYS_ACTIVITY_SUPPLEMENTAL.DOCUMENT_ID);
            incidentGr = this.pirUtil.getIncidentRecord(incidentSysId);
            if (!incidentGr.hasNext()) {
                if (this._log.atLevel(global.GSLog.DEBUG))
                    this._log.debug("[insertOrUpdateTimelineEvent] Incident Record not found with sys_id: " + incidentSysId);
                return;
            }
        } else {
            incidentSysId = incidentGr.getUniqueValue();
        }
        if (shouldUpdateSystemEvents) {
            var timelineEvents = this.retrieveTimelineData(incidentSysId).events;
        }
        var payload = activitySupplementalGr.getValue(this.constants.SYS_ACTIVITY_SUPPLEMENTAL.PAYLOAD);
        payload = JSON.parse(payload || {});
        if (payload.flag) {
            if (!isSystemGeneratedEvent) {
                var pirGR = this.pirUtil.getPirByIncidentSysId(incidentSysId);
                if (pirGR.next()) {
                    events = JSON.parse(pirGR.getValue(this.constants.POST_INCIDENT_REVIEW.TIMELINE_EVENTS)).events;
                } else {
                    if (this._log.atLevel(global.GSLog.DEBUG))
                        this._log.debug("[insertOrUpdateTimelineEvent] Post incident report record not found for incident: " + incidentSysId);
                    return;
                }
            }

            var journalFieldGr = new GlideRecord(this.constants.JOURNAL_FIELD.TABLE);
            if (journalFieldGr.get(activitySupplementalGr.getValue(this.constants.SYS_ACTIVITY_SUPPLEMENTAL.EVENT_ID))) {
                var userGr = this.getUserByUserName(activitySupplementalGr.getValue(this.constants.SYS_ACTIVITY_SUPPLEMENTAL.CREATED_BY));
                var userName = (userGr && userGr.isValidRecord()) ? userGr.getValue(this.constants.USER.NAME) : "-";
                flaggedEvent = {
                    id: GlideSecureRandomUtil.getSecureRandomString(6),
                    timestamp: journalFieldGr.getValue(this.constants.JOURNAL_FIELD.CREATED_ON),
                    message: gs.getMessage("{0}: {1} flagged by {2}", [incidentGr[journalFieldGr.getValue(this.constants.JOURNAL_FIELD.ELEMENT)].getLabel(), journalFieldGr.getValue(this.constants.JOURNAL_FIELD.MESSAGE), userName]),
                    eventType: this.constants.SYS_ACTIVITY_SUPPLEMENTAL.ACTIVITY_FLAGGED._KEY,
                    generatedBy: isSystemGeneratedEvent ? this.constants.GENERATED_BY.SYSTEM : this.constants.GENERATED_BY.USER,
                    associatedUser: userName,
                    category: {
                        source: this.constants.EVENT_SOURCE.INCIDENT,
                        id: activitySupplementalGr.getUniqueValue()
                    },
                };
                if (shouldUpdateSystemEvents) {
                    existingEvent = this._getEvent(timelineEvents, incidentSysId, this.constants.SYS_ACTIVITY_SUPPLEMENTAL.ACTIVITY_FLAGGED._KEY);
                    if (existingEvent) {
                        flaggedEvent.isHidden = existingEvent.isHidden;
                    }
                }
                events.push(flaggedEvent);
            }

            if (isSystemGeneratedEvent) {
                return;
            } else {
                pirGR.setValue(this.constants.POST_INCIDENT_REVIEW.TIMELINE_EVENTS, JSON.stringify({
                    "events": events
                }));
                pirGR.update();
            }
        } else if (!isSystemGeneratedEvent) {
            this.removeTimelineEventIfPresent(incidentSysId, activitySupplementalGr.getUniqueValue());
        }
    },

    getUserByUserName: function(userName) {
        if (gs.nil(userName)) {
            return null;
        }
        var userGr = new GlideRecord(this.constants.USER.TABLE);
        userGr.addQuery('user_name', userName);
        userGr.setLimit(1);
        userGr.query();
        if (userGr.next()) {
            return userGr;
        }
        return null;
    },
    _getCustomEvents: function(events) {
        var customEvents = [];
        for (var index = 0; index < events.length; index++) {
            var event = events[index];
            if (event.eventType == "CUSTOM_EVENT") {
                customEvents.push(event);
            }
        }
        return customEvents;
    },
    retrieveTimelineData: function(incidentSysId) {
        var events = [];
        var settings = [];
        var gr = this.pirUtil.getPirByIncidentSysId(incidentSysId);
        if (gr.next()) {
            events = JSON.parse(gr.getValue('timeline_events')).events;
            events = this.getTranslatedEvents(events);
            settings = JSON.parse(gr.getValue('timeline_settings'));
        }
        return {
            events: events,
            settings: settings
        };
    },
    fetchPreviewPageData: function(incidentSysId) {
        var timelineEvents = [];
        var timelineUserPreferences = [];
        var gr = this.pirUtil.getPirByIncidentSysId(incidentSysId);
        if (gr.next()) {
            timelineEvents = JSON.parse(gr.getValue('timeline_events')).events;
            timelineUserPreferences = JSON.parse(gr.getValue('timeline_settings'));
            timelineEvents = this.getTranslatedEvents(timelineEvents, timelineUserPreferences, true);
        }
        var sortedEvents;
        if (timelineUserPreferences.orderOfEvents == "asc") {
            sortedEvents = timelineEvents.sort(function(event1, event2) {
                var duration1 = new GlideDuration();
                duration1.setValue(event2.timestamp);
                var duration2 = new GlideDuration();
                duration2.setValue(event1.timestamp);
                var timediff = duration2.subtract(duration1);
                return timediff.getNumericValue() / 1000;
            });
        } else {
            sortedEvents = timelineEvents.sort(function(event1, event2) {
                var duration1 = new GlideDuration();
                duration1.setValue(event1.timestamp);
                var duration2 = new GlideDuration();
                duration2.setValue(event2.timestamp);
                var timediff = duration2.subtract(duration1);
                return timediff.getNumericValue() / 1000;
            });
        }
        var eventGroupingInSeconds = (timelineUserPreferences.eventGrouping && timelineUserPreferences.eventGrouping.enabled) ? timelineUserPreferences.eventGrouping.eventGroupingInSeconds : 0;
        var groupedEvents = [];
        var proximityEvents = {
            "events": []
        };
        for (var index = 0; index < sortedEvents.length; index++) {
            var event = sortedEvents[index];
            var targetTimezone = gs.getSession().getTimeZoneName();
            var gdtTargetCurrent = new GlideDateTime(targetTimezone);
            var currentDateTimeGlideObj = new GlideDateTime(event.timestamp);
            gdtTargetCurrent.setValue(currentDateTimeGlideObj);
            event.formattedDateTime = gdtTargetCurrent.getDisplayValue();
            if (index != 0 && index != sortedEvents.length - 1) {
                var previousDateTime = sortedEvents[index - 1].timestamp;
                var dateTime1 = new GlideDateTime(previousDateTime);
                var dateTime2 = new GlideDateTime(event.timestamp);
                // Calculate the difference in days
                var differenceInDays = GlideDateTime.subtract(dateTime2, dateTime1).getDayPart();
                if (differenceInDays == 0) {
                    var dateTimevalues = gdtTargetCurrent.getDisplayValue().split(' ');
                    if (dateTimevalues.length == 3) {
                        event.formattedDateTime = dateTimevalues[1] + " " + dateTimevalues[2].toLowerCase();
                    } else {
                        event.formattedDateTime = dateTimevalues[1];
                    }
                }
            }
            // continue based on certain conditions for timeline settings
            if ((event.isHidden) ||
                (event.eventType == "CUSTOM_EVENT" && !timelineUserPreferences.showManuallyAddedEvents) ||
                (event.isDeleted)) {
                continue;
            }
            if (Object.keys(proximityEvents.events).length == 0) { //Create proximity group events date time to display
                proximityEvents.timestamp = event.timestamp;
                proximityEvents.eventType = event.eventType;
                proximityEvents.formattedDateTime = event.formattedDateTime;
            }
            var duration1 = new GlideDuration();
            duration1.setValue(event.timestamp);
            var duration2 = new GlideDuration();
            duration2.setValue(proximityEvents.timestamp);
            var timediff = duration2.subtract(duration1);
            if (eventGroupingInSeconds == 0) {
                groupedEvents.push({
                    timestamp: event.timestamp,
                    formattedDateTime: event.formattedDateTime,
                    eventType: event.eventType,
                    events: [event]
                });
            } else if (event.eventType == "INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT" || event.eventType == "INCIDENT_RESOLVED") { //Incident accepted as major incident type should not be grouped
                if (Object.keys(proximityEvents.events).length == 0) {
                    proximityEvents.events.push(event);
                    groupedEvents.push(proximityEvents);
                    proximityEvents = {
                        events: []
                    };
                } else {
                    groupedEvents.push(proximityEvents);
                    groupedEvents.push({
                        timestamp: event.timestamp,
                        formattedDateTime: event.formattedDateTime,
                        eventType: event.eventType,
                        events: [event]
                    });
                    proximityEvents = {
                        "events": []
                    };
                }
            } else if (Math.abs(timediff.getNumericValue() / 1000) <= eventGroupingInSeconds) { //Add to the group if the event is in close proximity
                proximityEvents['events'].push(event);
            } else { //Start creating a new promixity group
                groupedEvents.push(proximityEvents);
                proximityEvents = {
                    timestamp: event.timestamp,
                    formattedDateTime: event.formattedDateTime,
                    eventType: event.eventType,
                    events: [event]
                };
            }
        }
        if (Object.keys(proximityEvents.events).length != 0) { //Adding the left out grouped events
            groupedEvents.push(proximityEvents);
        }
        return {
            "events": groupedEvents
        };
    },
    markPublish: function(incidentSysId, state) {
        var status = 200;
        var message = "";
        try {
            var gr = this.pirUtil.getPirByIncidentSysId(incidentSysId);
            if (gr.next()) {
                gr.setValue(this.constants.POST_INCIDENT_REVIEW.STATE._KEY, state);
                gr.update();
                if (state === 'published')
                    message = gs.getMessage("Post incident report has been marked published.");
                else if (state === 'draft')
                    message = gs.getMessage("Post incident report has been marked unpublished.");
            }
        } catch (error) {
            message = error.message;
            status = 404;
        }
        return {
            message: message,
            status: status
        };
    },
    _getIncidentTasksByIncidentSysId: function(incidentSysId) {
        var gr = new GlideRecordSecure(this.constants.INCIDENT_TASK.TABLE);
        gr.addQuery(this.constants.INCIDENT_TASK.INCIDENT, incidentSysId);
        gr.setLimit(1);
        gr.query();
        return gr;
    },
    fetchIncidentRelatedData: function(incidentSysID) {
        var output = {};
        var resolvedTimeDisplayValue = '';
        var resolvedTimeActualValue = '';
        var assignedTo = {};
        var userId = [];
        var coAuthors = [];
        var relatedRecords = [];
        var timelineLabels = [gs.getMessage('Time to identify'), gs.getMessage('Time to respond'), gs.getMessage('Time to resolve')];
        var incidentGR = this.pirUtil.getIncidentRecord(incidentSysID);
        if (incidentGR.next()) {
            resolvedTimeDisplayValue = incidentGR.getDisplayValue(this.constants.INCIDENT.RESOLVED_AT);
            resolvedTimeActualValue = incidentGR.getValue(this.constants.INCIDENT.RESOLVED_AT);
            var createdTime = new GlideDateTime(incidentGR.getValue(this.constants.INCIDENT.CREATED_BY));
            var identifiedTime = "";
            if (incidentGR.getValue(this.constants.INCIDENT.PROPOSED_AT) !== '')
                identifiedTime = new GlideDateTime(incidentGR.getValue(this.constants.INCIDENT.PROPOSED_AT));
            else
                identifiedTime = new GlideDateTime(incidentGR.getValue(this.constants.INCIDENT.PROMOTED_AT));
            var promotedTime = new GlideDateTime(incidentGR.getValue(this.constants.INCIDENT.PROMOTED_AT));
            var resolvedTime = new GlideDateTime(resolvedTimeActualValue);
            var identifyDuration = GlideDateTime.subtract(createdTime, identifiedTime);
            var responseDuration = GlideDateTime.subtract(identifiedTime, promotedTime);
            var resolutionDuration = GlideDateTime.subtract(promotedTime, resolvedTime);
            var timeList = [];
            var requiredTimeList = [];
            timeList.push(Math.abs(new GlideDateTime(identifyDuration.getValue()).getNumericValue() / 1000));
            timeList.push(Math.abs(new GlideDateTime(responseDuration.getValue()).getNumericValue() / 1000));
            timeList.push(Math.abs(new GlideDateTime(resolutionDuration.getValue()).getNumericValue() / 1000));
            for (var time in timeList) {
                var timeToConvert = timeList[time];
                var days = Math.floor(timeToConvert / 60 / 60 / 24);
                if (days <= 9)
                    days = "0" + days;
                var hours = Math.floor((timeToConvert / 60 / 60) % 24);
                if (hours <= 9)
                    hours = "0" + hours;
                var minutes = Math.floor(timeToConvert / 60) % 60;
                if (minutes <= 9)
                    minutes = "0" + minutes;
                var seconds = timeToConvert % 60;
                if (seconds <= 9)
                    seconds = "0" + seconds;
                if (days == "00")
                    requiredTimeList.push(hours + ":" + minutes + ":" + seconds);
                else
                    requiredTimeList.push(days + ":" + hours + ":" + minutes + ":" + seconds);
            }
            output["incidentTimings"] = requiredTimeList;
            output['timelineLabels'] = timelineLabels;
            var userGr = new GlideRecord('sys_user');
            userGr.addQuery(this.constants.SYS_ID, incidentGR.getValue(this.constants.INCIDENT.ASSIGNED_TO));
            userGr.query();
            if (userGr.next()) {
                assignedTo["name"] = userGr.getDisplayValue('name');
                assignedTo["avatar"] = userGr.getDisplayValue('avatar');
                assignedTo["id"] = userGr.getUniqueValue();
            }
            output["assignedTo"] = assignedTo;
            var problemId = incidentGR.getValue('problem_id');
            if (problemId != null) {
                var problemObj = this.fetchRelatedRecordInfo(problemId, 'problem');
                if (problemObj != null) {
                    problemObj["type"] = gs.getMessage('Problem');
                    problemObj["table"] = 'problem';
                    relatedRecords.push(problemObj);
                }
            }
            var changeRequestId = incidentGR.getValue('rfc');
            if (changeRequestId != null) {
                var changeRequestObj = this.fetchRelatedRecordInfo(changeRequestId, 'change_request');
                if (changeRequestObj != null) {
                    changeRequestObj["type"] = gs.getMessage('Change request');
                    changeRequestObj["table"] = 'change_request';
                    relatedRecords.push(changeRequestObj);
                }
            }
            var causedByChange = incidentGR.getValue('caused_by');
            if (causedByChange != null) {
                var causedByChangeObj = this.fetchRelatedRecordInfo(causedByChange, 'change_request');
                if (causedByChangeObj != null) {
                    causedByChangeObj["type"] = gs.getMessage('Caused by change');
                    causedByChangeObj["table"] = 'change_request';
                    relatedRecords.push(causedByChangeObj);
                }
            }
            output['relatedRecords'] = relatedRecords;
        }
        var pGr = this.pirUtil.getPirByIncidentSysId(incidentSysID);
        if (pGr.next()) {
            output['pirState'] = pGr.getDisplayValue('state');
            output['summary'] = pGr.getValue('report_draft');
            output['pirId'] = pGr.getValue('sys_id');
        }
        output['coAuthors'] = this._getCoAuthorsByIncidentSysId(incidentSysID);
        var daysToPublish = gs.getProperty('sn_sow_inc.pir.publish.hours');
        if (daysToPublish != '' && daysToPublish != 0) {
            if (daysToPublish <= this.constants.DISPLAY_TIME_CONSTANT)
                output["pir_sla"] = gs.getMessage("{0} hours", [daysToPublish]);
            else
                output["pir_sla"] = gs.getMessage("{0} days", [(daysToPublish / 24)]);
            var publishByTimeGDT = new GlideDateTime();
            publishByTimeGDT.setDisplayValue(resolvedTimeDisplayValue);
            publishByTimeGDT.addSeconds(daysToPublish * 60 * 60);
            output["publishBy"] = publishByTimeGDT.getDisplayValue();
            var currentTime = new GlideDateTime();
            var resolvedTemp = new GlideDateTime(resolvedTimeActualValue);
            var publishTime = GlideDateTime.subtract(resolvedTemp, publishByTimeGDT);
            var elapsedTime = GlideDateTime.subtract(resolvedTemp, currentTime);
            var percentElaspsed = Math.abs(((new GlideDateTime(elapsedTime.getValue()).getNumericValue() / 1000) / (new GlideDateTime(publishTime.getValue()).getNumericValue() / 1000)) * 100);
            if (percentElaspsed >= 100)
                output["alert"] = 'critical';
            else if (percentElaspsed > 70 && percentElaspsed < 100)
                output["alert"] = 'warning';
            else
                output['alert'] = 'info';
        } else {
            output['publishBy'] = null;
        }
        output['access_permission'] = this.getPermissionsForUser(incidentSysID, incidentGR);
        return output;
    },
    getDefaultTemplate: function() {
        return gs.getMessage('sn_sow_inc_draft_report_html');
    },
    fetchRelatedRecordInfo: function(recordId, table) {
        var recordInfo = {};
        var recordGr = new GlideRecord(table);
        recordGr.addQuery(this.constants.SYS_ID, recordId);
        recordGr.setLimit(1);
        recordGr.query();
        if (recordGr.next()) {
            recordInfo['number'] = recordGr.getDisplayValue('number');
            recordInfo['description'] = recordGr.getDisplayValue('short_description');
            recordInfo['assigned_to'] = recordGr.getDisplayValue('assigned_to');
            recordInfo['sysId'] = recordGr.getValue(this.constants.SYS_ID);
            return recordInfo;
        } else
            return null;
    },
    getUsersWithResponsiblity: function(incidentSysId) {
        var userList = [];
        var userObj = {
            "users": []
        };
        var role = "itil";
        if (GlidePluginManager.isActive('com.snc.itsm.roles'))
            role = 'sn_incident_write';
        var userGR = new GlideRecord('sys_user_has_role');
        userGR.addEncodedQuery('user.active=true^role.name=' + role);
        userGR.orderBy('name');
        userGR.query();
        while (userGR.next()) {
            var user = userGR.user;
            var userDetails = {};
            var userName = '';
            userDetails["avatarProps"] = {};
            userDetails["avatarProps"].imageSrc = user.getDisplayValue('avatar');
            userDetails["id"] = user.getDisplayValue('user_name');
            var userId = user.getValue(this.constants.SYS_ID);
            var contact = new GlideRecord('contact');
            var query = 'user=' + userId + '^document.source_incident=' + incidentSysId;
            contact.addEncodedQuery(query);
            contact.setLimit(1);
            contact.query();
            var responsibility = '';
            if (contact.next()) {
                responsibility = contact.getDisplayValue('responsibility');
            }
            if (responsibility !== '')
                userName = gs.getMessage("{0} ({1})", [user.getDisplayValue('name'), responsibility]);
            else
                userName = user.getDisplayValue('name');
            userDetails["avatarProps"].userName = userName;
            userDetails["label"] = userName;
            userList.push(userDetails);
        }
        userObj["users"] = userList;
        return userObj;
    },
    saveCoAuthorsForPIR: function(incidentSysId, coAuthors, output) {
        var users = [];
        var saveQuery = "";
        for (var author in coAuthors) {
            users.push(coAuthors[author].id);
        }
        for (var user in users) {
            var id = users[user];
            if (saveQuery == "")
                saveQuery += id;
            else
                saveQuery += "," + id;
        }
        var response = "";
        var pGr = new GlideRecord(this.constants.POST_INCIDENT_REVIEW.TABLE);
        pGr.addQuery('incident_ref', incidentSysId);
        pGr.setLimit(1);
        pGr.query();
        if (pGr.next()) {
            pGr.setValue('co_authors', saveQuery);
            response = pGr.update();
        }
        if (response === incidentSysId) {
            output["message"] = gs.getMessage("Successfully Saved Co-authors");
            return output;
        } else {
            output["message"] = gs.getMessage("Failed to Save Co-authors");
            output["status"] = 500;
            return output;
        }
    },
    getUserSysIdFromName: function(user) {
        var usr = new GlideRecord('sys_user');
        usr.addQuery('name', user);
        usr.setLimit(1);
        usr.query();
        if (usr.next())
            return usr.getValue(this.constants.SYS_ID);
    },
    updatePIRSummary: function(sysId, summary, output) {
        var response = "";
        var pGr = new GlideRecord('sn_sow_inc_post_incident_review');
        pGr.addQuery('sys_id', sysId);
        pGr.setLimit(1);
        pGr.query();
        if (pGr.next()) {
            pGr.setValue('report_draft', summary);
            response = pGr.update();
        }
        if (response === sysId) {
            output["message"] = gs.getMessage("Successfully Updated PIR Summary");
            return output;
        } else {
            output["message"] = gs.getMessage("Failed to Update PIR Summary");
            output["status"] = 500;
            return output;
        }
    },
    getPermissionsForUser: function(incidentSysId, incidentGR) {
        if (!incidentGR) {
            incidentGR = new GlideRecord('incident');
            incidentGR.get(incidentSysId);
        }
        var loggedInUser = gs.getUserName();
        var coAuthors = this._getCoAuthorsByIncidentSysId(incidentSysId);
        var assignedToUser = this._getAssignedToByIncidentSysId(incidentSysId);
        var accessPermission = {};
        var userRoleGr = new GlideRecord('sys_user_has_role');
        if (gs.hasRole('major_incident_manager') || this._isUserAnAuthor(gs.getUserID(), coAuthors) || loggedInUser === assignedToUser) {
            accessPermission["canEditContributors"] = userRoleGr.canRead();
            accessPermission["canEditTimeline"] = true;
            accessPermission["canAddTimelineEvent"] = true;
            accessPermission["canEditSummary"] = true;
            accessPermission["canEditRelatedRecords"] = true;
            accessPermission["canPreviewAndDownloadPIR"] = true;
            accessPermission["canPublish"] = true;
            accessPermission["canViewPirSlaBanner"] = true;
        } else if (incidentGR.canWrite()) {
            accessPermission["canEditContributors"] = false;
            accessPermission["canEditTimeline"] = true;
            accessPermission["canAddTimelineEvent"] = false;
            accessPermission["canEditSummary"] = false;
            accessPermission["canEditRelatedRecords"] = false;
            accessPermission["canPreviewAndDownloadPIR"] = true;
            accessPermission["canPublish"] = false;
            accessPermission["canViewPirSlaBanner"] = false;
        } else if (incidentGR.canRead()) {
            accessPermission["canEditContributors"] = false;
            accessPermission["canEditTimeline"] = true;
            accessPermission["canAddTimelineEvent"] = false;
            accessPermission["canEditSummary"] = false;
            accessPermission["canEditRelatedRecords"] = false;
            accessPermission["canPreviewAndDownloadPIR"] = false;
            accessPermission["canPublish"] = false;
            accessPermission["canViewPirSlaBanner"] = false;
        } else {
            accessPermission["canEditContributors"] = false;
            accessPermission["canEditTimeline"] = false;
            accessPermission["canAddTimelineEvent"] = false;
            accessPermission["canEditSummary"] = false;
            accessPermission["canEditRelatedRecords"] = false;
            accessPermission["canPreviewAndDownloadPIR"] = false;
            accessPermission["canPublish"] = false;
            accessPermission["canViewPirSlaBanner"] = false;
        }
        return accessPermission;
    },
    _isUserAnAuthor: function(userSysId, coAuthors) {
        var isUserAnAuthor = false;
        for (var index in coAuthors) {
            var user = coAuthors[index];
            if (user.id && user.id == userSysId) {
                isUserAnAuthor = true;
                break;
            }
        }
        return isUserAnAuthor;
    },
    _getCoAuthorsByIncidentSysId: function(incidentSysId) {
        var coAuthors = [];
        var gr = this.pirUtil.getPirByIncidentSysId(incidentSysId);
        if (gr.next()) {
            authors = gr.getValue('co_authors');
            var userGr = new GlideRecordSecure('sys_user');
            userGr.addQuery(this.constants.SYS_ID, 'IN', authors);
            userGr.query();
            while (userGr.next()) {
                var coAuthorSchema = {
                    "user": "",
                    "imageSrc": "",
                    "id": ""
                };
                coAuthorSchema["user"] = userGr.getDisplayValue('name');
                coAuthorSchema["imageSrc"] = userGr.getDisplayValue('avatar');
                coAuthorSchema["id"] = userGr.getUniqueValue();
                coAuthors.push(coAuthorSchema);
            }
        }
        return coAuthors;
    },
    _getUserRecord: function(sysId) {
        var userGr = new GlideRecordSecure('sys_user');
        userGr.addQuery(this.constants.SYS_ID, sysId);
        userGr.setLimit(1);
        userGr.query();
        if (userGr.next()) {
            return userGr;
        } else {
            return null;
        }
    },
    getTranslatedEvents: function(timelineEvents, timelineUserPreferences, isPreviewData) {
        var translatedEvents = [];
        for (var index = 0; index < timelineEvents.length; index++) {
            var event = timelineEvents[index];
            if (isPreviewData && (event.isHidden && !timelineUserPreferences.showHiddenEventsInEditView) ||
                (event.eventType == this.CUSTOM_EVENT && !timelineUserPreferences.showManuallyAddedEvents) ||
                (event.isDeleted)) {
                continue;
            }
            var userGr = this._getUserRecord(event.associatedUser);
            var user = userGr ? userGr.getDisplayValue('name') : "_";
            if (event.eventType == "INCIDENT_CREATED") {
                event.message = gs.getMessage("Incident created by {0}", [user]);
            } else if (event.eventType == this.constants.INCIDENT.INCIDENT_CLOSED._KEY) {
                event.message = gs.getMessage("Incident closed by {0}", [user]);
            } else if (event.eventType == this.constants.INCIDENT.INCIDENT_RESOLVED._KEY) {
                event.message = gs.getMessage("Incident marked as Resolved by {0}", [user]);
            } else if (event.eventType == this.constants.INCIDENT.INCIDENT_ACCEPTED_AS_MAJOR_INCIDENT._KEY) {
                event.message = gs.getMessage("Incident accepted as Major Incident by {0}", [user]);
            } else if (event.eventType == this.constants.INCIDENT.INCIDENT_PROPOSED_AS_MAJOR_INCIDENT._KEY) {
                event.message = gs.getMessage("Incident proposed as Major Incident by {0}", [user]);
            } else if (event.eventType == this.constants.INCIDENT_TASK.INCIDENT_TASK_CREATED._KEY) {
                event.message = gs.getMessage("Incident task created by {0}", [user]);
            } else if (event.eventType == this.constants.INCIDENT_TASK.INCIDENT_TASK_CLOSED._KEY) {
                event.message = gs.getMessage("Incident task closed by {0}", [user]);
            }
            translatedEvents.push(event);
        }
        return translatedEvents;
    },
    _getAssignedToByIncidentSysId: function(incidentSysId) {
        var assignedToSysId = "";
        var assignedToUserName = "";
        var incidentGR = this.pirUtil.getIncidentRecord(incidentSysId);
        if (incidentGR.next()) {
            assignedToSysId = incidentGR.getValue(this.constants.INCIDENT.ASSIGNED_TO);
        }
        if (assignedToSysId !== "") {
            var assignedUser = this._getUserRecord(assignedToSysId);
            if (assignedUser) {
                assignedToUserName = assignedUser.getValue(this.constants.USER.USER_NAME);
            }
        }
        return assignedToUserName;
    },
    getDateTimeFormats: function() {
        var dateTimeFormats = {};
        var choiceListObj = GlideChoiceList.getChoiceList(this.constants.USER.TABLE, this.constants.USER.DATE_FORMAT);
        choiceListObj.removeNone();
        var choiceListSize = choiceListObj.getSize();
        var choices = [];
        for (var i = 0; i < choiceListSize; i++) {
            var choice = choiceListObj.getChoice(i);
            if (choice.getValue() == this.constants.SYS_DATE_TIME_FORMAT) {
                var label = gs.getMessage('{0} (default)', gs.getProperty('glide.sys.date_format'));
                choices.unshift({
                    "id": gs.getProperty('glide.sys.date_format'),
                    "label": label
                });
            } else if (gs.getProperty('glide.sys.date_format') != choice.getValue()) {
                choices.push({
                    "id": choice.getValue(),
                    "label": choice.getLabel()
                });
            }
        }
        dateTimeFormats['dateFormats'] = choices;
        choiceListObj = GlideChoiceList.getChoiceList(this.constants.USER.TABLE, this.constants.USER.TIME_FORMAT);
        choiceListObj.removeNone();
        choiceListSize = choiceListObj.getSize();
        choices = [];
        for (var i = 0; i < choiceListSize; i++) {
            choice = choiceListObj.getChoice(i);
            if (choice.getValue() == this.constants.SYS_DATE_TIME_FORMAT) {
                var label = gs.getMessage('{0} (default)', gs.getProperty('glide.sys.time_format'));
                choices.unshift({
                    "id": gs.getProperty('glide.sys.time_format'),
                    "label": label
                });
            } else if (gs.getProperty('glide.sys.time_format') != choice.getValue()) {
                choices.push({
                    "id": choice.getValue(),
                    "label": choice.getLabel() + ''
                });
            }
        }
        dateTimeFormats['timeFormats'] = choices;
        return dateTimeFormats;
    },
    type: 'PIRManagerSNC'
};
