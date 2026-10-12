/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var numList = [];
    var hours = api.state.hours;
    var minutes = api.state.minutes;
    var seconds = api.state.seconds;

    //If scheduled job already exists get the values for it
    if (api.state.scheduledJob !== null) {
        api.data.look_up_scheduled_job.refresh();
    }

    //No job so populate the default values
    else {
        numList.push(Number(hours));
        numList.push(Number(minutes));
        numList.push(Number(seconds));

        //Add 0 to beginning of single digit numbers to make it user-friendly for displaying time
        for (var i = 0; i < numList.length; i++) {
            if (numList[i] >= 0 && numList[i] < 10) {
                numList[i] = ("0" + numList[i]).slice(-2);
            }
        }

        api.setState('hours', numList[0]);
        api.setState('minutes', numList[1]);
        api.setState('seconds', numList[2]);
    }
}
