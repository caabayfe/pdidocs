/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var schedule = { ...event.context.item.value.template_schedule};
    api.setState('templateName',event.context.item.value.template_name);
    api.setState('templateId',event.context.item.value.template_sys_id);

    // set run start to current date/time
    const d = new Date();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    var run_start = d.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    switch (event.payload.item.id) {
        case "schedule":
        	var schedule = {
                "run_type": "daily",
                "time_zone": "",
                "time": "00:00:00", // this is only used for the UI. on save it will update either run_time or entered_time depending on if a time zone is selected. 
                "run_dayofweek" : "1",
                "run_dayofmonth" : "1",
                "run_start" : run_start,
                "active": true,
			    "run_period_days" : "0",
				"run_period_time" : "00:00:00",
                "entered_time" : "00:00:00",
                "run_time" : "00:00:00"
			};
            api.setState('schedule',schedule);
            var scheduleValidation = {
                timeInValid: false,
                startTimeInvalid: false,
                repeatTimeInvalid: false,
                repeatDaysInvalid: false,
                periodicallyDayTimeRequired: false
            };
            api.setState('scheduleValidation',scheduleValidation);
            api.setState('disableScheduleSaveButton',false);
            helpers.modal.open('schedule_modal');
            break;
        case "edit":
            // add default values if they don't exist
            if(!schedule.time_zone)
                schedule.time_zone = "";

            if(schedule.time_zone) {
                // a time zone is selected. set the time value (used by ui) to entered_time
                schedule.time = schedule.entered_time;
            } else {
                // no time zone selected then use run_time
                schedule.time = schedule.run_time;
            }

            if(!schedule.time)
                schedule.time = "00:00:00";

            if(!schedule.run_dayofweek)
                schedule.run_dayofweek = "1";

            if(!schedule.run_dayofmonth)
                schedule.run_dayofmonth = "1";

            if(!schedule.run_period_days && schedule.run_period_days != "0")
                schedule.run_period_days = "1";

            if(!schedule.run_period_time)
                schedule.run_period_time = "00:00:00";

            if(!schedule.run_start)
                schedule.run_start = run_start;
            
            api.setState('schedule',schedule);

            var scheduleValidation = {
                timeInvalid: false,
                startTimeInvalid: false,
                repeatTimeInvalid: false,
                repeatDaysInvalid: false,
                periodicallyDayTimeRequired: false
            };
            api.setState('scheduleValidation',scheduleValidation);
            api.setState('disableScheduleSaveButton',false);
            
            helpers.modal.open('schedule_modal');
            break;
        case "activate":
            api.data.de_duplication_template_set_schedule_active_status.execute({
                'scheduleId' : schedule.sys_id,
                'status' : true
            });
            break;
        case "deactivate":
            api.data.de_duplication_template_set_schedule_active_status.execute({
                'scheduleId' : schedule.sys_id,
                'status' : false
            });
            break;
    }
}
