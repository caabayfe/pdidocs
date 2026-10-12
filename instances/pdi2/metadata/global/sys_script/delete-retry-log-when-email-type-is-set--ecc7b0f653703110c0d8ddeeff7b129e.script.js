(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("sys_email_retry_log");
    if (gr.isValid()) {
        gr.addQuery('email_table', current.sys_table_name);
        gr.addQuery('email_sys_id', current.getUniqueValue());
        gr.deleteMultiple();
    }
})(current, previous);
