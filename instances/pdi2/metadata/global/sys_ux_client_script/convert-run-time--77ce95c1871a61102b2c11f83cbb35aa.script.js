/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var runTime = api.data.look_up_scheduled_job.result.entered_time.value;
    
    if (runTime === null) {
        api.setState('minutes', '00');
        api.setState('seconds', '00');
        return;
    }

    var numList = [];
    var hours = '';
    var minutes = '';
    var seconds = '';

    if (runTime !== null) {
        for (var i = 11; i < runTime.length; i++) {
            if (i < 13) {
                hours += runTime[i];
            }
            else if (i > 13 && i < 16) {
                minutes += runTime[i];
            }
            else if (i > 16) {
                seconds += runTime[i];
            }
        }
        
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
