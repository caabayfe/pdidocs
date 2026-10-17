/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    const startTimeRegex = /^(?:\d{4})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]) (?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    const schedule = api.state.schedule;
    var scheduleValidation = {...api.state.scheduleValidation};
    switch (event.elementId) {
        case "schedule_time":
            scheduleValidation.timeInvalid = !timeRegex.test(event.payload.fieldValue);
            break;
        case "start_date_time":
            scheduleValidation.startTimeInvalid = !startTimeRegex.test(event.payload.fieldValue);
            break;
        case "periodically_time":
            scheduleValidation.repeatTimeInvalid = !timeRegex.test(event.payload.fieldValue);
            scheduleValidation.periodicallyDayTimeRequired = (event.payload.fieldValue == "00:00:00" && (schedule.run_period_days * 1) == 0);
            break;
        case "periodically_days":
            scheduleValidation.repeatDaysInvalid = (event.payload.fieldValue == "");
            scheduleValidation.periodicallyDayTimeRequired = (schedule.run_period_time == "00:00:00" && (event.payload.fieldValue * 1) == 0);
            break;
    }

    var disableScheduleSaveButton = scheduleValidation.timeInvalid;
    if(schedule.run_type == "periodically")
        disableScheduleSaveButton = (scheduleValidation.startTimeInvalid || scheduleValidation.repeatTimeInvalid || scheduleValidation.repeatDaysInvalid || scheduleValidation.periodicallyDayTimeRequired);
    
    api.setState('scheduleValidation',scheduleValidation);
    api.setState('disableScheduleSaveButton', disableScheduleSaveButton);


}
