/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);
    const {
        eventName,
        eventPayload
    } = event.payload;
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    var blockcontext = { ...eventPayload.blockcontext
    };
    switch (eventName) {
        case "CLONE_FREQUENCY_SELECTED":
            var selectedCloneFrequency = eventPayload.value;
            blockcontext.frequencyCard.cloneFrequency.selected = selectedCloneFrequency;
            blockcontext.cloneFrequencySummaryValue = eventPayload.item.label;
            switch (selectedCloneFrequency) {
                case "0":
                    resetControls();
                    publish();
                    break;
                case "1":
                    resetControls();
                    blockcontext.frequencyCard.weeklyBiweekly.show = true;
                    blockcontext.frequencyCard.occurrences.show = true;
                    blockcontext.frequencyCard.weeklyBiweekly.label = blockcontext.frequencyCard.weeklyBiweekly.weeklyLabel;
                    getMaxCloneOccurrences(1);
                    break;
                case "2":
                    resetControls();
                    blockcontext.frequencyCard.weeklyBiweekly.show = true;
                    blockcontext.frequencyCard.occurrences.show = true;
                    blockcontext.frequencyCard.weeklyBiweekly.label = blockcontext.frequencyCard.weeklyBiweekly.biweeklyLabel;
                    getMaxCloneOccurrences(2);
                    break;
                case "3":
                    resetControls();
                    blockcontext.frequencyCard.weeklyBiweekly.show = true;
                    blockcontext.frequencyCard.occurrences.show = true;
                    blockcontext.frequencyCard.weeklyBiweekly.label = blockcontext.frequencyCard.weeklyBiweekly.monthlyLabel;
                    getMaxCloneOccurrences(3);
                    break;
            }
            break;
        case "OCCURRENCES_ENTERED":
            blockcontext.frequencyCard.occurrences.count = eventPayload.fieldValue;
            blockcontext.frequencyCard.estimatedEdnDateShow = false;
            if (blockcontext.frequencyCard.occurrences.count > 0 && blockcontext.frequencyCard.occurrences.count <= blockcontext.frequencyCard.occurrences.maxCount) {
                blockcontext.frequencyCard.estimatedEdnDateShow = true;
                getEstimatedSeriesEndDate();
            } else {
                publish();
            }
            break;
        /*case "SUNDAY_CLICKED":
            resetDays();
            blockcontext.frequencyCard.weeklyBiweekly.days.sunday.variant = "primary";
            blockcontext.frequencyCard.weeklyBiweekly.days.sunday.selected = "true";
            onDayClicked();
            break;
        case "MONDAY_CLICKED":
            resetDays();
            blockcontext.frequencyCard.weeklyBiweekly.days.monday.variant = "primary";
            blockcontext.frequencyCard.weeklyBiweekly.days.monday.selected = "true";
            onDayClicked();
            break;
        case "TUESDAY_CLICKED":
            resetDays();
            blockcontext.frequencyCard.weeklyBiweekly.days.tuesday.variant = "primary";
            blockcontext.frequencyCard.weeklyBiweekly.days.tuesday.selected = "true";
            onDayClicked();
            break;
        case "WEDNESDAY_CLICKED":
            resetDays();
            blockcontext.frequencyCard.weeklyBiweekly.days.wednesday.variant = "primary";
            blockcontext.frequencyCard.weeklyBiweekly.days.wednesday.selected = "true";
            onDayClicked();
            break;
        case "THURSDAY_CLICKED":
            resetDays();
            blockcontext.frequencyCard.weeklyBiweekly.days.thursday.variant = "primary";
            blockcontext.frequencyCard.weeklyBiweekly.days.thursday.selected = "true";
            onDayClicked();
            break;
        case "FRIDAY_CLICKED":
            resetDays();
            blockcontext.frequencyCard.weeklyBiweekly.days.friday.variant = "primary";
            blockcontext.frequencyCard.weeklyBiweekly.days.friday.selected = "true";
            onDayClicked();
            break;
        case "SATURDAY_CLICKED":
            resetDays();
            blockcontext.frequencyCard.weeklyBiweekly.days.saturday.variant = "primary";
            blockcontext.frequencyCard.weeklyBiweekly.days.saturday.selected = "true";
            onDayClicked();
            break;*/
        default:
    }

    /*function resetDays() {
        blockcontext.frequencyCard.weeklyBiweekly.days.sunday.variant = "secondary";
        blockcontext.frequencyCard.weeklyBiweekly.days.sunday.selected = "false";
        blockcontext.frequencyCard.weeklyBiweekly.days.monday.variant = "secondary";
        blockcontext.frequencyCard.weeklyBiweekly.days.monday.selected = "false";
        blockcontext.frequencyCard.weeklyBiweekly.days.tuesday.variant = "secondary";
        blockcontext.frequencyCard.weeklyBiweekly.days.tuesday.selected = "false";
        blockcontext.frequencyCard.weeklyBiweekly.days.wednesday.variant = "secondary";
        blockcontext.frequencyCard.weeklyBiweekly.days.wednesday.selected = "false";
        blockcontext.frequencyCard.weeklyBiweekly.days.thursday.variant = "secondary";
        blockcontext.frequencyCard.weeklyBiweekly.days.thursday.selected = "false";
        blockcontext.frequencyCard.weeklyBiweekly.days.friday.variant = "secondary";
        blockcontext.frequencyCard.weeklyBiweekly.days.friday.selected = "false";
        blockcontext.frequencyCard.weeklyBiweekly.days.saturday.variant = "secondary";
        blockcontext.frequencyCard.weeklyBiweekly.days.saturday.selected = "false";
    }*/

    function resetControls() {
        //resetDays();
        blockcontext.frequencyCard.weeklyBiweekly.show = false;
        blockcontext.frequencyCard.occurrences.show = false;
        blockcontext.frequencyCard.estimatedEdnDateShow = false;
        blockcontext.frequencyCard.occurrences.count = "";
        blockcontext.frequencyCard.occurrences.label = blockcontext.frequencyCard.occurrences.labelText;
    }

    /*function onDayClicked() {
        if (blockcontext.frequencyCard.occurrences.count == 0) {
            publish();
        } else {
            getEstimatedSeriesEndDate();
        }
    }*/

    function getEstimatedSeriesEndDate() {
        var day = 0;
        /*if (blockcontext.frequencyCard.weeklyBiweekly.days.sunday.selected == "true") day = 7;
        else if (blockcontext.frequencyCard.weeklyBiweekly.days.monday.selected == "true") day = 1;
        else if (blockcontext.frequencyCard.weeklyBiweekly.days.tuesday.selected == "true") day = 2;
        else if (blockcontext.frequencyCard.weeklyBiweekly.days.wednesday.selected == "true") day = 3;
        else if (blockcontext.frequencyCard.weeklyBiweekly.days.thursday.selected == "true") day = 4;
        else if (blockcontext.frequencyCard.weeklyBiweekly.days.friday.selected == "true") day = 5;
        else if (blockcontext.frequencyCard.weeklyBiweekly.days.saturday.selected == "true") day = 6;
        blockcontext.frequencyCard.weeklyBiweekly.day = day;*/
        callUtilAPI({
                operation: 'GET_ESTIMATED_CLONE_FREQUENCY_END_DATE',
                requestedTime: blockcontext.estimatedStartDateTime == "-" ? "" : blockcontext.estimatedStartDateTime,
                cloneFrequency: blockcontext.frequencyCard.cloneFrequency.selected,
                numberOfOccurrences: blockcontext.frequencyCard.occurrences.count,
                days: day
            });
        /*if (day != 0) {
            
        }*/
    }

    function callUtilAPI(body) {
        return helpers.snHttp('/api/sn_instance_clone/clone/util', {
            method: 'POST',
            body: {
                ...body
            }
        }).then(response => {
            callbackHandler(body, response.response);
        }).catch(response => {
            try {
                console.log(body.operation + " failed: " + JSON.stringify(response.error));
            } catch (e) {
                console.log(body.operation + " failed: " + JSON.stringify(response));
            }
        });
    };

    function getMaxCloneOccurrences(selectedCloneFrequency) {
        callUtilAPI({
            operation: 'GET_MAX_CLONE_OCCURRENCES',
            maxRecurringCloneDuration: blockcontext.frequencyCard.maxRecurringCloneDuration,
            frequency: selectedCloneFrequency
        });
    }

    function callbackHandler(body, response) {
        switch (body.operation) {
            case 'GET_ESTIMATED_CLONE_FREQUENCY_END_DATE':
                blockcontext.frequencyCard.estimatedEndDateValue = response.result.estimatedSeriesEndDate;
                blockcontext.frequencyCard.estimatedEndDate = blockcontext.frequencyCard.estimatedEndDateLabelText + blockcontext.frequencyCard.estimatedEndDateValue;
                break;
            case 'GET_MAX_CLONE_OCCURRENCES':
                blockcontext.frequencyCard.occurrences.maxCount = response.result.maxCloneOccurrences;
                blockcontext.frequencyCard.occurrences.label = blockcontext.frequencyCard.occurrences.labelText + blockcontext.frequencyCard.occurrences.maxCount;
                break;
        }
        publish();
    }

    function validateCloneRequest(){
        blockcontext.disableContinuebutton = false;

        if(!blockcontext.targetInstanceId) {
            blockcontext.disableContinuebutton = true;
        }

        if(!blockcontext.estimatedStartDateTime || blockcontext.showConflictCalendarMessage) {
            blockcontext.disableContinuebutton = true;
        }

        if(blockcontext.frequencyCard.cloneFrequency.selected != '0') {
            if(!blockcontext.frequencyCard.occurrences.count || blockcontext.frequencyCard.occurrences.count <= 0 || blockcontext.frequencyCard.occurrences.count > blockcontext.frequencyCard.occurrences.maxCount) {
                blockcontext.disableContinuebutton = true;
            }
        }

        if(blockcontext.frequencyCard.weeklyBiweekly.day == 0) {
            blockcontext.disableContinuebutton = true;
        }
    }

    function publish() {
        validateCloneRequest();
        aceUtils.setContext(blockcontext);
    }
}
