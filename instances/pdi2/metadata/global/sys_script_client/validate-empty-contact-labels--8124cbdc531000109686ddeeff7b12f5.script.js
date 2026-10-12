function onSubmit() {
   //Type appropriate comment here, and begin script below
    g_form.hideAllFieldMsgs();
    var isValid = true;
    if(g_form.getBooleanValue('contact_live_agent')){
        if(g_form.getValue('support_hours_label') === '') {
            g_form.showFieldMsg('support_hours_label', getMessage('Chat label cannot be empty'), 'error');
            isValid = false;
        }
    }
    if(g_form.getBooleanValue('send_email')){
        if(g_form.getValue('support_email_label')  === '') {
            g_form.showFieldMsg('support_email_label', getMessage('Email label cannot be empty'), 'error');
            isValid = false;
        }
        if(g_form.getValue('support_email')  === '' ) {
            g_form.showFieldMsg('support_email', getMessage('Email Address cannot be empty'), 'error');
            isValid = false;
        }
    }
    if(g_form.getBooleanValue('phone_call')){
        if(g_form.getValue('support_phone_label')  === '') {
            g_form.showFieldMsg('support_phone_label', getMessage('Call label cannot be empty'), 'error');
            isValid = false;
        }
        if(g_form.getValue('support_phone')  === '' ) {
            g_form.showFieldMsg('support_phone', getMessage('Phone number cannot be empty'), 'error');
            isValid = false;
        }
    }
    return isValid;
}
