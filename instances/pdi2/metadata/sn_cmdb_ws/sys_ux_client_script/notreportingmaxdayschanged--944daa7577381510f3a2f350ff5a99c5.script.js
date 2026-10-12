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
    var isInRange = (newValue > 0 ) && (newValue <=90);
    var settingsStatus = JSON.parse(JSON.stringify(api.state.settingsStatus));
    if(isInt && isInRange) {
        settingsStatus.notReportingMaxDays.value = newValue;
        settingsStatus.notReportingMaxDays.valid = true;
        api.setState('notReportingMaxDays',newValue); 
        api.setState('hideDiscoSourceInputWarning',true);
        api.setState('isDirty',true);
    } else {
        var warning = "";
        if(!isInt) {
            warning += await helpers.translate("Number of days must be an integer. ");
        }
        if(!isInRange) {
            warning += await helpers.translate("Input must be in the range of 1 to 90 days");
        }
        api.setState('discoSourceInputWarning',warning); 
        api.setState('hideDiscoSourceInputWarning',false);
        api.setState('isDirty',false);
        settingsStatus.notReportingMaxDays.value = newValue;
        settingsStatus.notReportingMaxDays.valid = false;
        settingsStatus.notReportingMaxDays.invalidReason = warning;
    }
    api.setState('settingsStatus',settingsStatus);
}
