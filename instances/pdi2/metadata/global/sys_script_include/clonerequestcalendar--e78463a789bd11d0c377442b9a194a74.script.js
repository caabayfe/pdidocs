var CloneRequestCalendar = Class.create();

CloneRequestCalendar.prototype = {
    initialize: function(instanceId) {
        this.instanceId = instanceId;
    },
    getRelatedSchedules: function(startDate, endDate) {
        var conf = {
            date_range: [startDate, endDate],
            collect_window_data: true,
            allow_partially_overlapping_windows: true,
            show_timing_info: false
        };
        var conflictChecker = new global.CheckCloneConflicts(this.instanceId, conf);
        if (!conflictChecker.getWindowData) {
            gs.error("CloneCheckConflicts does not have \"getWindowData\" defined. That is probably customized. Cannot continue.");
            return {
                maintenance: [],
                blackout: [],
                status: 'error',
                message: "CloneCheckConflicts does not have getWindowData",
                is_invalid_conflict_checker_si: true
            };
        }

        var conflictResult = conflictChecker.checkConflicts();
        if (conflictResult.status == "error") {
            return {
                maintenance: [],
                blackout: [],
                status: conflictResult.status,
                message: conflictResult.message,
                is_invalid_conflict_checker_si: true
            };
        } else {
            var windowdata = conflictChecker.getWindowData();
            windowdata.status = conflictResult.status;
            windowdata.is_invalid_conflict_checker_si = false;
            return windowdata;
        }
    },

    type: 'CloneRequestCalendar'
};
