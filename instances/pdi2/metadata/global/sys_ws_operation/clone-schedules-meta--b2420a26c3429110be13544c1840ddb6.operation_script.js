(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    // implement resource here
    var startDate = new GlideDateTime(request.pathParams.start_date);
    var endDate = new GlideDateTime(request.pathParams.end_date);

    function getDcSchedules(windowArr) {

        var schedules = {};
        for (var ci in windowArr) {
            var w = windowArr[ci];

            var sh = schedules[w.scheduleId];

            sh = {
                sys_id: w.scheduleId,
                date_ranges: [],
                related_cis: []
            };

            var sp = new GlideSchedule(w.scheduleId);
            sh.title = w.change;
            sh.time_zone = sp.getTimeZone();


            var range = {
                start: w.start,
                end: w.end
            };
            sh.date_ranges.push(range);
            schedules[w.scheduleId] = sh;
        }
        var res = [];
        for (var k in schedules) {
            res.push(schedules[k]);
        }
        return res;
    }

    var gr = new GlideRecord('instance');
    gr.addQuery('instance_id', request.pathParams.instanceId);
    gr.query();
    if (gr.next()) {
        var cloneObj;
        cloneObj = new global.CloneRequestCalendar(request.pathParams.instanceId);
        var data = cloneObj.getRelatedSchedules(startDate, endDate);
        if (data.status == "success") {
            return {
                maintenance: getDcSchedules(data.maintenance),
                blackout: getDcSchedules(data.blackout),
                status: data.status,
                warn_invalid_conflict_checker: data.is_invalid_conflict_checker_si
            };
        } else {
            return {
                maintenance: data.maintenance,
                blackout: data.blackout,
                status: data.status,
                message: data.message,
                warn_invalid_conflict_checker: data.is_invalid_conflict_checker_si
            };
        }
    } else {
        return {
            status: "error",
            message: "Target instance is invalid"
        };
    }

})(request, response);
