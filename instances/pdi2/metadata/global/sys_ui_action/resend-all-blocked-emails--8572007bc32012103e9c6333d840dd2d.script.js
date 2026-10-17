var blockedEAGr = new GlideRecord('sys_blocked_email_address');
blockedEAGr.get(current.sys_id);

if (blockedEAGr.getValue("state") != 'unblocked') {
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage('Unblock the state of the email address to resend blocked emails'));
} else {
    var sys_id = current.getValue("sys_id");
    var gr = new GlideRecord("sys_blocked_email");
    gr.addQuery("blocked_email", sys_id);
    gr.addQuery("status", "new");
    gr.query();

    while (gr.next()) {
        var email_sys_id = gr.getValue("email");
        var email = current.getValue("email_address");
        var resendEmail = new ResendEmail();
        resendEmail.resend(email_sys_id, email);
        gr.setValue("status", "queued");
        gr.update();
    }
}
