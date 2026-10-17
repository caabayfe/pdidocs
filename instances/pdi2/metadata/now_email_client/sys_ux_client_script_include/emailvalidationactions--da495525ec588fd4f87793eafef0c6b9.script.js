function emailValidationActions() {
    return {
        sendEmail: function(api) {
            api.setState('emailValidationStatus', { value: true, timestamp: Date.now() });
            api.setState('emailSentValue', true);
        },

        cancelSendEmail: function(api) {
            api.setState('emailValidationStatus', { value: false, timestamp: Date.now() });
        },

        handleCloseEmailModal: function(api) {
            if (!api.state.emailValidationStatus.value || !api.state.emailSentValue) {
                console.log(api.state.emailValidationStatus.value);
                api.setState('emailValidationStatus', { value: false, timestamp: Date.now() });
            } else {
                api.setState('emailSentValue', false);
            }
        },

        prevalidate: async function(api, event, helpers, customValidations) {
            var payload = event.payload;
            var draftRecord = payload.draftRecord;
            var headings = [];
            var messages = [];

            // ─── Base Validation: Empty subject or body (constant) ───
            if (!draftRecord.subject || !draftRecord.body) {
                headings.push('Send incomplete email?');
                messages.push('There is no subject or message in the email.');
            }

            // ─── Custom Validations ───
            // Return { heading, message } to combine into the modal
            // Return { handled: true } if self-handled (notification/popover/etc.)
            // Return null if validation passed
            if (customValidations && customValidations.length) {
                for (var i = 0; i < customValidations.length; i++) {
                    var result = customValidations[i](draftRecord, api, helpers, payload);
                    if (result) {
                        if (result.handled) {
                            return;
                        }
                        if (result.heading) headings.push(result.heading);
                        if (result.message) messages.push(result.message);
                    }
                }
            }

            // ─── Show combined modal or proceed ───
            if (headings.length) {
                api.setState('emailPayload', {
                    draftRecord: draftRecord,
                    templateSysId: payload.templateSysId,
                    sendWithSMIMEError: payload.sendWithSMIMEError,
                    esignEnabled: payload.esignEnabled,
                    encryptionEnabled: payload.encryptionEnabled
                });
                api.setState('confirmEmailHeader', headings.join(' & '));
                api.setState('confirmEmailMessage', messages.join(' '));
                helpers.modal.open('confirm_email_validation');
                return;
            }

            // No issues — allow send
            api.setState('emailValidationStatus', { value: true, timestamp: Date.now() });
        }
    };
}
