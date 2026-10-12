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
        case "schedule_hours_input":
            schedule.hours = event.payload.fieldValue;
            break;
        case "schedule_minutes_input":
            schedule.minutes = event.payload.fieldValue;
            break;
        case "schedule_seconds_input":
            schedule.seconds = event.payload.fieldValue;
            break;
    }
    api.setState('schedule', schedule);
    api.setState('isDirty', true);
    api.emit('CHECK_FORM_STATUS');

}
