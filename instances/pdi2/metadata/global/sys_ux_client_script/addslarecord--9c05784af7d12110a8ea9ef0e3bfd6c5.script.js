/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var slaPercent = api.state.slaPercentage;
    var emailNotification = api.state.emailNotification;
    var smsTemplate = api.state.smsTemplate;
    var isSMSActive = api.state.payload.isSMSActive;
    var recordId = api.state.payload.fieldValue;
    var wizardId = 'e06b0afdeb7281102b57e53069522852';

    // Throw error if email notification field is empty
    if (emailNotification == null || emailNotification == '') {
        api.setState('errorMessage', 'Set at least one email notification type for this reminder.');
        api.setState('hideAlert1', false);
    }

    // Throw error if SLA percentage field is not valid
    else if (slaPercent < 1 || slaPercent > 99 || slaPercent == null) {
        api.setState('errorMessage', 'The SLA percentage must be a value between 1 and 99.');
        api.setState('hideAlert1', false);
    }

    // Throw error if there already exists a record with the input SLA percentage
    else if (api.data.look_up_records_1.results.length > 0) {
        api.setState('errorMessage', 'A reminder with the SLA percentage ' + slaPercent + ' already exists for this configuration.');
        api.setState('hideAlert1', false);
    }

    // No errors so create record
    else {
        var templateFields = 'percentage=' + slaPercent + '^email_notification=' + emailNotification + '^configuration=' + recordId;
        
        if (isSMSActive) {
            templateFields += "^sms=" + smsTemplate;
        }
        
        api.data.create_record_1.execute({
            table: 'sys_cs_auto_resolution_reminder',
		    templateFields: templateFields,
		    useSetDisplayValue: ''
        });
        helpers.modal.close("custom_1", {});
    }
}
