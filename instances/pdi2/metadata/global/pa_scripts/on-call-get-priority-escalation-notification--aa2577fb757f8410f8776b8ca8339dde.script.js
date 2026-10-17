function getTaskRecordPriority() {
    if (GlideDBObjectManager.get().getBase(current.contact_attempt.escalation_level.escalation.table + '') == 'task') {
        var taskGR = new GlideRecord(current.contact_attempt.escalation_level.escalation.table + '');
        if (taskGR.get(current.contact_attempt.escalation_level.escalation.source + ''))
            return taskGR.getValue('priority');
    } else {
        return null;
    }
}

getTaskRecordPriority();
