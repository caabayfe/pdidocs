(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sys_email_account');
    gr.addQuery('system_address_filter', current.getUniqueValue());
    gr.query();
    if (gr.hasNext())
        gs.addInfoMessage('System Address Filter is assigned to one or more email accounts but is inactive - default filter will be used for these accounts instead');
})(current, previous);
