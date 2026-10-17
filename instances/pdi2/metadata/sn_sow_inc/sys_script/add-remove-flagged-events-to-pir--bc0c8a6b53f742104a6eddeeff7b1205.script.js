(function executeRule(current, previous /*null when async*/ ) {

    if (current.operation() == 'delete') {
        new sn_sow_inc.PIRManager().removeTimelineEventIfPresent(current.getValue('document_id'), current.getUniqueValue());
    } else {
        new sn_sow_inc.PIRManager().insertOrUpdateTimelineEvent(current, null, false);
    }

})(current, previous);
