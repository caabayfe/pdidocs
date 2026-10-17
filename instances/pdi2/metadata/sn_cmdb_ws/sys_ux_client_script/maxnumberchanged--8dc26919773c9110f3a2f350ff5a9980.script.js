/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var newValue = event.payload.fieldValue;
    var isInt = Number.isInteger(parseFloat(newValue));
    var isInRange = (newValue > 0 ) && (newValue <=500000);
    var settingsStatus = JSON.parse(JSON.stringify(api.state.settingsStatus));
    if(isInt && isInRange) {
        settingsStatus.maxNumberOfRecords.value = newValue;
        settingsStatus.maxNumberOfRecords.valid = true;
        api.setState('maxNumberOfRecords',newValue);
        api.setState('hideMaxNumInputWarning',true);
        api.setState('isDirty',true);
    } else {
        var warning = "";
        if(!isInt) {
            warning += await helpers.translate("Number of records to process must be integer. ");
        }
        if(!isInRange) {
            warning += await helpers.translate("Input must be in the range of 1 to 500,000.");
        }
        api.setState('maxNumInputWarning',warning); 
        api.setState('hideMaxNumInputWarning',false);
        settingsStatus.maxNumberOfRecords.value = newValue;
        settingsStatus.maxNumberOfRecords.valid = false;
        settingsStatus.maxNumberOfRecords.invalidReason = warning;
        api.setState('isDirty',false);
    }

    api.setState('settingsStatus',settingsStatus);
}
