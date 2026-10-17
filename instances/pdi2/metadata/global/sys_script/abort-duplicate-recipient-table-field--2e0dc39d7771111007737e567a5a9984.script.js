(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sys_recipient_user_mapping');
    var isRecipientTableEmpty = current.recipient_table == null || current.recipient_table == '';
    if (isRecipientTableEmpty) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Recipient Table field can't be blank"));
    } else {
        gr.addQuery('recipient_table', current.recipient_table);
        gr.query();
        while (gr.next()) {
            if (current.sys_id != gr.sys_id) {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage("{0} is already present in Recipient Table field", current.recipient_table));
                break;
            }
        }
    }
})(current, previous);
