var ScheduleEntryValidation = Class.create();

// Test validity of a Schedule Entry
// -- sets error messages, field error messages, accordingly
// -- returns false if entry is not valid
ScheduleEntryValidation.isValid = function(cmn_schedule_span) {
    return new ScheduleEntryValidation(cmn_schedule_span).isValid();
};

ScheduleEntryValidation.prototype = {
    initialize: function(cmn_schedule_span) {
        this.cmn_schedule_span = cmn_schedule_span;
        this._valid = true;
        this._maxTimeSpan = false;
    },

    isValid: function() {
        this._validateRepeatCount();
        this._validateDates();
        this._validateNoOverlap();
        return this._valid;
    },

    _validateRepeatCount: function() {
        if (this.cmn_schedule_span.repeat_count <= 0) {
            this.cmn_schedule_span.repeat_count.setError(gs.getMessage("Value must be greater than 0"));
            this._valid = false;
        }
    },

    _validateDates: function() {
        // make sure dates are valid and end date >= start date
        if (this.cmn_schedule_span.start_date_time.nil() || this.cmn_schedule_span.end_date_time.nil()) {
            gs.addErrorMessage(gs.getMessage("The dates and times you entered were not valid"));
            this._valid = false;
        } else if (this.cmn_schedule_span.end_date_time.getXMLValue() < this.cmn_schedule_span.start_date_time.getXMLValue()) {
            gs.addErrorMessage(gs.getMessage("The end date and time must be after the start date and time"));
            this._valid = false;
        } else {
            var scheduleEntryMaxSpan = parseInt(gs.getProperty("glide.schedules.schedule_entry_max_span", "50"));
            scheduleEntryMaxSpan = parseInt(Math.min(scheduleEntryMaxSpan, 100));
            var startTime = new GlideDateTime();
            startTime.setDisplayValue(this.cmn_schedule_span.getDisplayValue("start_date_time"));
            startTime.addYearsLocalTime(scheduleEntryMaxSpan);
            var endTime = new GlideDateTime();
            endTime.setDisplayValue(this.cmn_schedule_span.getDisplayValue("end_date_time"));
            if (endTime > startTime) {
                gs.addErrorMessage(gs.getMessage("Schedule entry should not span for more than {0} years", scheduleEntryMaxSpan.toString()));
                this._valid = false;
                this._maxTimeSpan = true;
            }
        }
    },

    _validateNoOverlap: function() {
        if (this._maxTimeSpan) return;
        // Make sure that a repeating event does not overlap itself
        var spanTZ = "";
        var start_sdt = this.cmn_schedule_span.start_date_time.getGlideObject();
        if (!start_sdt.isFloating()) { // if the time zone is not floating, use span from the associated schedule
            spanTZ = this.cmn_schedule_span.schedule.time_zone;
        } else { // if the time zone is floating, use the session's time zone
            spanTZ = gs.getSession().getTimeZoneName();
        }

        var span = new GlideScheduleTimeSpan(this.cmn_schedule_span, spanTZ);
        if (span.overlapsSelf(this.cmn_schedule_span.start_date_time.getGlideObject(), this.cmn_schedule_span.end_date_time.getGlideObject())) {
            gs.addErrorMessage(gs.getMessage("The repeat type and date range results in overlapping events - please change to avoid overlaps"));
            this._valid = false;
        }
    },

    type: 'ScheduleEntryValidation'
};
