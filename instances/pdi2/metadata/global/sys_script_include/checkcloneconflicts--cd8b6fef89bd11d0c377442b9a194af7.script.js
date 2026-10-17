var CheckCloneConflicts = Class.create();
ChangeCheckConflicts.BLACKOUT_WINDOW = "blackout";
ChangeCheckConflicts.MAINTENANCE_WINDOW = "maintenance";
CheckCloneConflicts.prototype = {
    initialize: function(instanceId, config) {
        this.ciID = instanceId;
        this.collectWindowData = config && config.collect_window_data;
        if (this.collectWindowData)
            this._windowData = {
                maintenance: [],
                blackout: []
            };
        if (config && config.date_range) {
            this.startDate = config.date_range[0];
            this.endDate = config.date_range[1];
        }
        this.wall_clock_time = parseInt(gs.dateDiff(this.startDate.getDisplayValue(), this.endDate.getDisplayValue(), true));
        this.glideRecordUtil = new GlideRecordUtil();
        this.arrayUtil = new ArrayUtil();
        this.dcConflicts = {};
        this.dcConflicts.blackout = [];
        this.dcConflicts.maintenance = [];
    },

    /**
     * @builds conflict objects
     */
    _addWindow: function(changeId, windowType, windowElementId, relatedCIId, startDate, endDate) {
        switch (windowType) {
            case ChangeCheckConflicts.BLACKOUT_WINDOW:

                this._windowData.blackout.push({
                    change: changeId,
                    type: windowType,
                    scheduleId: windowElementId,
                    start: startDate,
                    end: endDate
                });
                break;

            case ChangeCheckConflicts.MAINTENANCE_WINDOW:

                var maintenanceConflict = {
                    change: changeId,
                    type: windowType,
                    scheduleId: windowElementId,
                    start: startDate,
                    end: endDate
                };
                this._windowData.maintenance.push(maintenanceConflict);
                break;
            default:
                break;
        }
    },

    /**
     * @gets conflicts 
     * @cId : instance Id
     * startDate : start date
     * endDate : end date
     * @return <string> : success or error
     */
    checkConflicts: function() {
        // checking conflicts
        var conflicts = CloneCollisionHelper.getConflictsByDate(this.ciID, this.startDate, this.endDate);
        if (conflicts.status == "success") {

            //checking blackout conflicts if any
            if (conflicts.blackoutConflicts.length > 0) {
                this.dcConflicts.blackout = conflicts.blackoutConflicts;
                for (var d = 0; d < this.dcConflicts.blackout.length; d++) {
                    var eachBlackout = this.dcConflicts.blackout[d];
                    if (this.collectWindowData)
                        this._addWindow(eachBlackout.changeNumber, ChangeCheckConflicts.BLACKOUT_WINDOW, eachBlackout.operationId, null, eachBlackout.start_date, eachBlackout.end_date);
                }
            }
            //checking for all remaining conflicts
            if (conflicts.maintenanceConflicts.length > 0) {
                this.dcConflicts.maintenance = conflicts.maintenanceConflicts;
                for (var c = 0; c < this.dcConflicts.maintenance.length; c++) {
                    var eachConflict = this.dcConflicts.maintenance[c];
                    this._addWindow(eachConflict.changeNumber, ChangeCheckConflicts.MAINTENANCE_WINDOW, eachConflict.operationId, null, eachConflict.start_date, eachConflict.end_date);
                }
            }
        }
        return {
            status: conflicts.status,
            message: conflicts.message
        };
    },

    /**
     * @returns conflict data
     */

    getWindowData: function() {
        if (!this.collectWindowData)
            throw "Window data collection not turned on.";
        return this._windowData;
    },
    type: 'CheckCloneConflicts'
};
