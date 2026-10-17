var CDSClientDownloadUtil = Class.create();
CDSClientDownloadUtil.prototype = {
    initialize: function() {
    },

    type: 'CDSClientDownloadUtil',

	scheduleCdsDownloadJob: function(jobId, duration) {
        var record = new GlideRecord("sysauto_script");
        if (!record.get(jobId))
            return false;

        //calculate a random start time
        var runPeriod = new GlideDuration(duration);
        var cdsPeakHoursProp = gs.getProperty("cds.peak_hours_utc", "7,23");
        var peakHours = cdsPeakHoursProp.split(",").map(Number);
        var cdsPeakHoursDriftProp = gs.getProperty("cds.peak_hours.max_drift_minutes", "30");
        var drift = parseInt(cdsPeakHoursDriftProp);
        var startTime = this.getRandomStartTimeForDownloadSchedule(runPeriod, peakHours, drift);

        //update job's periodic schedule
        record.setValue("run_type", "periodically");
        record.setValue("run_period", runPeriod);
        record.setValue("run_start", startTime);
        if(record.isValidField("entered_run_start"))
            record.setValue("entered_run_start", startTime);
        record.setValue("active", true);
        record.update();
        gs.info("Scheduled job {0} with calculated start time {1}", jobId, String(startTime));
        return true;
    },

    getRandomStartTimeForDownloadSchedule: function(runPeriod, peakHours, drift) {
        //get a random time for the given period
        var localDate = new GlideDateTime();
        localDate.add(this._getRandomInt(0, runPeriod.getNumericValue()));

        //adjust schedule time to avoid peakhours
        if (!peakHours)
            return localDate;

        //move the schedule by 1 + 2*drift mins when schedule is inside peak hours range
        var minutesOfDayUTC = this._getMinutesOfDayUTC(localDate);
        for (var i in peakHours) {
            var startMin = (peakHours[i] * 60 - drift);
            var endMin = ((peakHours[i] + 1) * 60 + drift) % 1440;
            if (this._isInMinutesRange(minutesOfDayUTC, startMin, endMin)) {
                localDate.add((60 + 2 * drift) * 60000);
                minutesOfDayUTC = this._getMinutesOfDayUTC(localDate);
            }
        }

        return localDate;
    },

    _getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    _getMinutesOfDayUTC: function(gdt) {
        var gt = new GlideTime(gdt.getNumericValue());
        return gt.getHourOfDayUTC() * 60 + gt.getMinutesUTC();
    },

    _isInMinutesRange: function(x, start, end) {
        if (start <= end)
            return x >= start && x <= end;
        else
            return x >= start || x <= end;
    },
};
