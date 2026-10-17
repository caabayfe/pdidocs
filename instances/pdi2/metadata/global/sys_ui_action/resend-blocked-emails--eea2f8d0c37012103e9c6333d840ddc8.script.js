if (current.getValue("status") == 'new') {
    var blocked_email_sys_id = current.getValue('blocked_email');
    var gr = new GlideRecord("sys_blocked_email_address");
    if (gr.get(blocked_email_sys_id)) {
        if (gr.getValue('state') == 'unblocked') {
            var email_address = gr.getValue('email_address');
            var resendEmail = new ResendEmail();
            resendEmail.resend(current.getValue('email'), email_address);
            current.setValue('status', 'sent');
            current.update();
        } else {
            var blockedEmailAddressLog = new GlideRecord('sys_blocked_email_address_log');
            blockedEmailAddressLog.setValue('blocked_email', blocked_email_sys_id);
            blockedEmailAddressLog.setValue('more_information', 'Unblock the state of the email address to resend blocked email ' + current.sys_id);
            blockedEmailAddressLog.insert();
        }
    }
}
