/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var scheduleString = '';
    var active = api.data.look_up_scheduled_job.result.active.value;
    var frequency = api.data.look_up_scheduled_job.result.run_type.value;
    var dayOfWeek = api.data.look_up_scheduled_job.result.run_dayofweek.displayValue;
    var dayOfMonth = api.data.look_up_scheduled_job.result.run_dayofmonth.displayValue;
    var runtime = api.data.look_up_scheduled_job.result.entered_time.value.substr(11); //remove date from value

    if (frequency === null || !active) {
        scheduleString = '';
    }
    else if (frequency === 'daily') {
        scheduleString = 'Daily at ' + runtime; 
    }
    else if (frequency === 'weekly') {
        scheduleString = 'Weekly on ' + dayOfWeek + ' at ' + runtime;
    }
    else {
        scheduleString = 'Monthly on day ' + dayOfMonth + ' at ' + runtime;
    }
    helpers.translate(scheduleString).then((translatedText) => {
      api.setState('scheduleString', translatedText);
    });
}
