/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var scheduledJob = api.state.scheduledJob;
    var frequency = api.state.frequency;
    var dayOfWeek = Number(api.state.dayOfWeek);
    var dayOfMonth = api.state.dayOfMonth;
    var active = api.state.active;
    var hours = String(api.state.hours);
    var minutes = String(api.state.minutes);
    var seconds = String(api.state.seconds);
    var numList = [];

    numList.push(Number(hours));
    numList.push(Number(minutes));
    numList.push(Number(seconds));

    //Add 0 to beginning of single digit numbers to make it user-friendly for displaying time
    for (var i = 0; i < numList.length; i++) {
        if (numList[i] >= 0 && numList[i] < 10) {
            numList[i] = ("0" + numList[i]).slice(-2);
        }
    }

    api.setState('hours', String(numList[0]));
    api.setState('minutes', String(numList[1]));
    api.setState('seconds', String(numList[2]));
    hours = String(numList[0]);
    minutes = String(numList[1]);
    seconds = String(numList[2]);
    var runtime = '1970-01-01 ' + hours + ':' + minutes + ':' + seconds;

    //Update scheduled job if one already exists
    if (scheduledJob !== null) {
        if (frequency === 'monthly') {
            api.data.update_record.execute({
                table: "sysauto_script",
                recordId: scheduledJob,
                templateFields: "run_type=" + frequency + "^active=" + active + "^run_dayofmonth=" + dayOfMonth + "^entered_time=" + runtime + "^time_zone=floating"
            });
        }
        else if (frequency === 'weekly') {
            api.data.update_record.execute({
                table: "sysauto_script",
                recordId: scheduledJob,
                templateFields: "run_type=" + frequency + "^active=" + active + "^run_dayofweek=" + dayOfWeek + "^entered_time=" + runtime + "^time_zone=floating"
            });
        }
        else {
            api.data.update_record.execute({
                table: "sysauto_script",
                recordId: scheduledJob,
                templateFields: "run_type=" + frequency + "^active=" + active + "^entered_time=" + runtime + "^time_zone=floating"
            });
        }
        helpers.modal.close("schedule_modal", {});
    }
}
