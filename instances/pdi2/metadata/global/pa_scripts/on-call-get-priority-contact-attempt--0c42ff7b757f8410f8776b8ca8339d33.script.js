function getTaskRecord() {
    if (GlideDBObjectManager.get().getBase(current.escalation_level.escalation.table + '') == 'task') {
        var taskGR = new GlideRecord(current.escalation_level.escalation.table + '');
        if (taskGR.get(current.escalation_level.escalation.source + ''))
            return taskGR.getValue('priority');
    } else {
        return null;
    }
}

getTaskRecord();
