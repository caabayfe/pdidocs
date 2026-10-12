(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (current.active) {
        var glideRecord = new GlideRecord('sys_notification_recipient');
        glideRecord.addActiveQuery();
        glideRecord.addQuery('notification', current.notification);
        glideRecord.addQuery('recipient_table', current.recipient_table);
        glideRecord.query();

        if ((glideRecord.getRowCount() == 1)) {
            glideRecord.next();
            if (current.getUniqueValue() != glideRecord.getUniqueValue()) {
                gs.addErrorMessage(gs.getMessage("Only one active record can be added for the Recipient Table: {0}.Please use the Additional Recipients related list to update the active record.",current.recipient_table));
                gs.addErrorMessage(gs.getMessage("To add another record for the Recipient Table: {0}, please mark the exiting record as inactive",current.recipient_table ));
                current.setAbortAction(true);
            }
        }
    }
})(current, previous);
