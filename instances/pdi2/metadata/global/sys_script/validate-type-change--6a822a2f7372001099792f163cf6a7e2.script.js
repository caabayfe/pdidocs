(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sys_email_account');
    gr.addQuery('system_address_filter', current.getUniqueValue());
    gr.query();
    if (gr.hasNext()) {
        gs.addErrorMessage('Type cannot be changed since current system address filter is assigned to one or more email accounts');
        current.setAbortAction(true);
    }
})(current, previous);
