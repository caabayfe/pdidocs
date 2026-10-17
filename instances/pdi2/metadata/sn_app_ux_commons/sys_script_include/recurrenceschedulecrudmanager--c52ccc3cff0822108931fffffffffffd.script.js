var RecurrenceScheduleCRUDManager = Class.create();

RecurrenceScheduleCRUDManager.prototype = {
    initialize: function() {
        this.scheduleSysId = "";
        this.scheduleDetails = {};
    },

	/** Recurrende Get Section */
	getCmnScheduleDetails: function(scheduleSysId) {
        var schedule = {};
        var result = {};
        this.scheduleSysId = scheduleSysId;
        if (!scheduleSysId) {
            return {
                success: true,
                partial_success: false,
                error_messages: [],
                data: {}
            };
        }
        var scheduleGr = new GlideRecord('cmn_schedule');
        scheduleGr.addQuery('sys_id', this.scheduleSysId);
        scheduleGr.setLimit(1);
        scheduleGr.query();
        if (scheduleGr.next()) {
            var scheduleSpanGr = new GlideRecord('cmn_schedule_span');
            scheduleSpanGr.addQuery('schedule', this.scheduleSysId);
            scheduleSpanGr.setLimit(1);
            scheduleSpanGr.query();
            if (scheduleSpanGr.next()) {
                schedule = {
                    event: {
                        event_title: scheduleGr.getValue('name'),
                        start_date_time: scheduleSpanGr.getValue('start_date_time'),
                        end_date_time: scheduleSpanGr.getValue('end_date_time'),
                        monthly_type: scheduleSpanGr.getValue('monthly_type'),
                        days_of_week: scheduleSpanGr.getValue('days_of_week'),
                        all_day: scheduleSpanGr.getValue('all_day') === '1',
                        yearly_type: scheduleSpanGr.getValue('yearly_type'),
                        repeat_type: scheduleSpanGr.getValue('repeat_type'),
                        repeat_until: scheduleSpanGr.getValue('repeat_until'),
                        month: scheduleSpanGr.getValue('month'),
                        repeat_count: scheduleSpanGr.getValue('repeat_count'),
                        time_zone: scheduleGr.getValue('time_zone')
                    }
                };
            }
            var scheduleSpanChildGr = new GlideRecord('cmn_other_schedule');
            scheduleSpanChildGr.addQuery('schedule', this.scheduleSysId);
            scheduleSpanChildGr.query();
            const exceptions = [];
            while (scheduleSpanChildGr.next()) {
                var childScheduleName = "";
                var childScheduleSysId = scheduleSpanChildGr.getValue('child_schedule');
                // Fetch the name of the child schedule
                var grSchedule = new GlideRecord('cmn_schedule');
                if (grSchedule.get(childScheduleSysId))
                    childScheduleName = grSchedule.getValue('name');
                // Fetch child details
                var scheduleChildSpanGr = new GlideRecord('cmn_schedule_span');
                scheduleChildSpanGr.addQuery('schedule', childScheduleSysId);
                scheduleChildSpanGr.query();
                if (scheduleChildSpanGr.next()) {
                    const exception = {
                        event_title: childScheduleName,
                        start_date_time: scheduleChildSpanGr.getValue('start_date_time'),
                        end_date_time: scheduleChildSpanGr.getValue('end_date_time'),
                        monthly_type: scheduleChildSpanGr.getValue('monthly_type'),
                        days_of_week: scheduleChildSpanGr.getValue('days_of_week'),
                        all_day: scheduleChildSpanGr.getValue('all_day') === "1",
                        yearly_type: scheduleChildSpanGr.getValue('yearly_type'),
                        repeat_type: scheduleChildSpanGr.getValue('repeat_type'),
                        repeat_until: scheduleChildSpanGr.getValue('repeat_until'),
                        month: scheduleChildSpanGr.getValue('month'),
                        repeat_count: scheduleChildSpanGr.getValue('repeat_count'),
                        sys_id: childScheduleSysId
                    };
                    exceptions.push(exception);
                }
            }
            schedule = {
                ...schedule,
                exceptions
            };
            this.scheduleDetails = schedule;
            result = {
                success: true,
                partial_success: false,
                error_messages: [],
                data: schedule
            };
            return result;
        } else
            throw new Error('Schedule not found for the provided scheduleSysId');
    },
	
    /** Recurrende Create Section */
    _scheduleInsert: function(scheduleGr) {
        try {
            return scheduleGr.insert();
        } catch (error) {
            throw new Error("Error in Inserting the record" + error.message);
        }
    },

    _scheduleUpdate: function(scheduleGr) {
        try {
            return scheduleGr.update();
        } catch (error) {
            throw new Error("Error in Updating the record " + error.message);
        }
    },

    _scheduleQuery: function(scheduleGr) {
        try {
            scheduleGr.query();
        } catch (error) {
            throw new Error("Error in Querying the record " + error.message);
        }
    },

    _scheduleDelete: function(scheduleGr) {
        try {
            scheduleGr.deleteRecord();
        } catch (error) {
            throw new Error("Error in Deleting the record " + error.message + " sys Id" + scheduleGr.sys_id);
        }
    },

    _updateScheduleEntries: function(scheduleEntryObject, sEvent, type, documentKey) {
        scheduleEntryObject.name = sEvent.name;
        scheduleEntryObject.time_zone = sEvent.timeZone;
        scheduleEntryObject.type = type;

        if (documentKey) {
            scheduleEntryObject.document_key = documentKey
        }
        // If Exception then add the key to table
        if (type === 'exclude' && sEvent.key) {
            scheduleEntryObject.document_key = sEvent.key;
        }
        return scheduleEntryObject;
    },

    _updatScheduleSpanEntries: function(schedulSysId, scheduleEntryObject, sEvent, type) {

        if (Object.keys(sEvent).length) {
            scheduleEntryObject.schedule = schedulSysId;
            scheduleEntryObject.start_date_time = sEvent.startDateTime;
            scheduleEntryObject.time_zone = sEvent.timeZone;
            scheduleEntryObject.end_date_time = sEvent.endDateTime;
            scheduleEntryObject.name = sEvent.name;
            scheduleEntryObject.monthly_type = sEvent.monthlyType;
            scheduleEntryObject.days_of_week = sEvent.daysOfWeek;
            scheduleEntryObject.all_day = sEvent.allDay;
            scheduleEntryObject.yearly_type = sEvent.yearlyType;
            scheduleEntryObject.repeat_type = sEvent.repeatType;
            scheduleEntryObject.setValue("repeat_until", sEvent.repeatUntil.toString());
            // scheduleEntryObject.repeat_until = sEvent.repeatUntil.toString();
            scheduleEntryObject.month = sEvent.month;
            scheduleEntryObject.repeat_count = sEvent.repeatCount;
            scheduleEntryObject.float_day = sEvent.floatDay;
            scheduleEntryObject.float_week = sEvent.floatWeek;
            scheduleEntryObject.type = type;
        }

        return scheduleEntryObject;
    },

    _handleErrorMessages: function(schedulSysId) {
        if (!schedulSysId) {
            throw new Error('Overlap Error');
        }
    },

    _createScheduleAndScheduleEntry: function(sEvent, type, documentKey, parentScheduleSysId) {
        // Gr for cmn_schedule
        var scheduleGr = new GlideRecord("cmn_schedule");
        scheduleGr.initialize();

        // generate Gr for schedule
        scheduleGr = this._updateScheduleEntries(scheduleGr, sEvent, type, documentKey);

        // insert record into cmn_schedule table
        var schedulSysId = this._scheduleInsert(scheduleGr);

        // throw error if schedulSysId is not generated
        this._handleErrorMessages(schedulSysId);

        // Gr for cmn_schedule_span
        var scheduleSpanGr = new GlideRecord("cmn_schedule_span");
        scheduleSpanGr.initialize();

        // generate Gr for schedule span
        scheduleSpanGr = this._updatScheduleSpanEntries(schedulSysId, scheduleSpanGr, sEvent, type);

        // insert record into cmn_schedule_span table
        var scheduleSpanSysId = this._scheduleInsert(scheduleSpanGr);

        if (!scheduleSpanSysId) {
            // delete the schedule schedulSysId because this is the validation error for span entry
            this._deleteScheduleRecurrenceUtil(schedulSysId);

            // delete the parentScheduleSysId if it is already created
            if (parentScheduleSysId) {
                this.deleteScheduleRecurrenceEvent(parentScheduleSysId);
            }
        }
         // throw error if scheduleSpanSysId is not generated
         this._handleErrorMessages(scheduleSpanSysId);

        return schedulSysId;
    },

    _createRecurrenceEvent: function(rEvent, type, documentKey, parentScheduleSysId) {
      var scheduleId = this._createScheduleAndScheduleEntry(rEvent, type, documentKey, parentScheduleSysId);
      return scheduleId;
    },

    _createOtherSchedule: function(mainScheduleSysId, childScheduleSysId, type) {
        var scheduleChildSpanGr = new GlideRecord("cmn_other_schedule");
        scheduleChildSpanGr.initialize();

        scheduleChildSpanGr.schedule = mainScheduleSysId;
        scheduleChildSpanGr.child_schedule = childScheduleSysId;
        scheduleChildSpanGr.type = type;

        var otherScheduleId = this._scheduleInsert(scheduleChildSpanGr);

        this._handleErrorMessages(otherScheduleId);

        return otherScheduleId;
    },

    createRecurrenceSchedule: function(recurrenceData) {
        var {
            mainEvent,
            exceptionEvents
        } = recurrenceData;

        var mainScheduleSysId = this._createRecurrenceEvent(mainEvent, "meeting", recurrenceData.documentKey);

        if (exceptionEvents.length) {
            for (const exception of exceptionEvents) {
                var childScheduleSysId = this._createRecurrenceEvent(exception, "exclude", '', mainScheduleSysId);
                this._createOtherSchedule(mainScheduleSysId, childScheduleSysId, "include");
            }
        }

        return {
            success: true,
            sys_id: mainScheduleSysId,
            message: "Record created successfully"
        };
    },

    /** Recurrende Update Section */

    _getScheduleById: function(scheduleId) {
        var scheduleGr = new GlideRecord('cmn_schedule');
        scheduleGr.addQuery('sys_id', scheduleId);
        scheduleGr.setLimit(1);
        this._scheduleQuery(scheduleGr);
        return scheduleGr;
    },

    _getScheduleSpanById: function(scheduleId) {
        var scheduleSpanGr = new GlideRecord('cmn_schedule_span');
        scheduleSpanGr.addQuery('schedule', scheduleId);
        scheduleSpanGr.setLimit(1);
        this._scheduleQuery(scheduleSpanGr);
        return scheduleSpanGr;
    },

    _getOtherScheduleById: function(scheduleId) {
        var scheduleSpanChildGr = new GlideRecord('cmn_other_schedule');
        scheduleSpanChildGr.addQuery('schedule', scheduleId);
        this._scheduleQuery(scheduleSpanChildGr);
        return scheduleSpanChildGr;
    },

    _updateScheduleAndScheduleSpan: function(scheduleId, rEvent, type) {
        // Get Gr for schedule
        var scheduleGr = this._getScheduleById(scheduleId);

        var scheduleSysId = '';
        if (scheduleGr.next()) {
            // update the schedule Gr
            scheduleGr = this._updateScheduleEntries(scheduleGr, rEvent, type);
            // get the schedule sysId
            scheduleSysId = this._scheduleUpdate(scheduleGr);
        }

        // throw error if scheduleSysId is not generated
        this._handleErrorMessages(scheduleSysId);

        // Get Gr for schedule span
        var scheduleSpanGr = this._getScheduleSpanById(scheduleId);

        var scheduleSpanSysId = '';
        if (scheduleSpanGr.next()) {
            // update the schedule span Gr
            scheduleSpanGr = this._updatScheduleSpanEntries(scheduleId, scheduleSpanGr, rEvent, type);
             // get the schedule span sysId
            scheduleSpanSysId = this._scheduleUpdate(scheduleSpanGr);
        }

        // throw error if scheduleSpanSysId is not generated
        this._handleErrorMessages(scheduleSpanSysId);

        return scheduleSysId;
    },

    _updateRecurrenceEvent: function(scheduleId, rEvent, type) {
        var updatedScheduleId = this._updateScheduleAndScheduleSpan(scheduleId, rEvent, type);
        return updatedScheduleId;
    },

    _deleteScheduleRecurrenceUtil(sysId) {
       // delete span
       var scheduleSpanGr = this._getScheduleSpanById(sysId);
       if (scheduleSpanGr.next()) {
           this._scheduleDelete(scheduleSpanGr);
       }

       // delete schedule
       var scheduleGr = this._getScheduleById(sysId);
       if (scheduleGr.next()) {
           this._scheduleDelete(scheduleGr);
       }
    },

    deleteScheduleRecurrenceEvent: function(sysId) {
         // delete other_schedule
         var scheduleChildSpanGr = this._getOtherScheduleById(sysId);
         while (scheduleChildSpanGr.next()) {
            const exceptionSchedulId = scheduleChildSpanGr.child_schedule;

           this._deleteScheduleRecurrenceUtil(exceptionSchedulId);

           this._scheduleDelete(scheduleChildSpanGr);
         }

        this._deleteScheduleRecurrenceUtil(sysId);

        return true;
    },

    updateRecurrenceSchedule: function(scheduleId, recurrenceData) {
        var {
            mainEvent,
            exceptionEvents
        } = recurrenceData;

        var mainScheduleSysId = this._updateRecurrenceEvent(scheduleId, mainEvent, "meeting");

        if (mainScheduleSysId === scheduleId) {

            var otherSchedules = this._getOtherScheduleById(mainScheduleSysId);

            var existingRecords = {};

            // While loop for otherSchedules and set all the existing records
            while (otherSchedules.next()) {
                var scheduleGr = this._getScheduleById(otherSchedules.child_schedule);

                if (scheduleGr.next()) {
                    if (scheduleGr.document_key) {
                        existingRecords[scheduleGr.document_key] = scheduleGr.sys_id;
                    }
                }
            }

            /**
             * Synchronized data
             * 1. If Exceptions are more than otherSchedules then create recurrenceEvent for extra
             * 2. If Exceptions are less than otherSchedules then delete the remaining recurrenceEvent
             */

            // Process the incoming keys from exceptions
            var processedKeys = new Set();

            if (exceptionEvents.length) {
                for (const exception of exceptionEvents) {
                    var key = exception.key;

                    if (existingRecords[key]) {
                        this._updateRecurrenceEvent(existingRecords[key], exception, "exclude");
                    } else {
                        var childScheduleSysId = this._createRecurrenceEvent(exception, "exclude");
                        this._createOtherSchedule(mainScheduleSysId, childScheduleSysId, "include");
                    }

                    processedKeys.add(key);
                }
            }

            // Delete the records that are not in the exceptions
            for (var existingKey in existingRecords) {
                if (!processedKeys.has(existingKey)) {
                    this.deleteScheduleRecurrenceEvent(existingRecords[existingKey]);
                }
            }
        }

        return {
            success: true,
            sys_id: mainScheduleSysId,
            message: "Record Updated successfully"
        };

    }
};
