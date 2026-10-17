/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let schedule = JSON.parse(JSON.stringify(api.state.schedule));
    switch(event.elementId) {
        case "schedule_enabled_checkbox":
            schedule.active = event.payload.value;
            break;
        case "schedule_run_type_select":
            schedule.run_type = event.payload.value;
            break;
        case "schedule_weekly_select":
            schedule.run_dayofweek = event.payload.value;
            break;
        case "schedule_monthly_select":
            schedule.run_dayofmonth = event.payload.value;
            break;
        case "schedule_time":
            schedule.time = event.payload.value;
            if(schedule.time_zone) {
                // a time zone is selected. set the entered_time value to entered_time (used by ui) 
                schedule.entered_time = schedule.time;
            } else {
                // no time zone selected then use run_time value to run_time (used by ui) 
                schedule.run_time = schedule.time;
            }
            break;
        case "time_zone_select":
            schedule.time_zone = event.payload.value;
            if(schedule.time_zone) {
                // a time zone is selected. set the time value (used by ui) to entered_time
                schedule.time = schedule.entered_time;
            } else {
                // no time zone selected then use run_time
                schedule.time = schedule.run_time;
            }
            if(!schedule.time)
                schedule.time = "00:00:00";
            break;
        case "periodically_time":
            schedule.run_period_time = event.payload.value;
            break;
        case "periodically_days":
            schedule.run_period_days = event.payload.fieldValue;
            break;
        case "start_date_time":
            schedule.run_start = event.payload.value;
            break;  
    }
    api.setState('schedule', schedule);
}
